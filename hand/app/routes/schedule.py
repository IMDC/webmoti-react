import json
import logging
import os
import textwrap
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from openai import AsyncOpenAI
from openai.types.beta.threads.message_create_params import (
    Attachment,
    AttachmentToolFileSearch,
)
from openai.types.beta.threads.run import Usage

from core.models import ScheduleRequest
from core.utils import is_pytest_running

router = APIRouter(prefix="/api")

openai_api_key = os.getenv("OPENAI_API_KEY")
if not is_pytest_running() and not openai_api_key:
    raise RuntimeError("Missing environment variable: OPENAI_API_KEY")

# identity to schedule
schedule: Dict[str, Dict[str, str]] = {}


def get_system_prompt():
    system_prompt = """
        Please analyze the class notes and times provided and generate a schedule in 
        JSON format without any other text output. If no notes are provided, mostly empty, 
        or inaccessible, return an error. Don't create a schedule from missing data. 
        The schedule should have a number of topics based on the length of the notes. 
        Set topic times based on the depth and complexity of the content, allocating more 
        time to denser topics rather than distributing time evenly. Some topics may be hands 
        on or demonstrations with few words and will need a longer time. 

        Output format:
        {
            "title": "<title based on notes>",
            "<time 1 in 24h>": "<topic1>",
            "<time 2>": "<topic2>",
            "...": "...",
        }
    """
    return textwrap.dedent(system_prompt)


async def get_assistant(client: AsyncOpenAI):
    ASSISTANT_NAME = "Class Schedule Analyzer"
    system_prompt = get_system_prompt()

    a_list = await client.beta.assistants.list()
    async for a in a_list:
        # need to create new assistant if instructions change
        if a.name == ASSISTANT_NAME and a.instructions == system_prompt:
            logging.info("found previous assistant")
            return a

    # assistant not found, create new one
    logging.info("creating new assistant")
    return await client.beta.assistants.create(
        name=ASSISTANT_NAME,
        instructions=system_prompt,
        model="gpt-4o-mini",
        tools=[{"type": "file_search"}],
        # json_object isn't available with file_search
        # response_format={"type": "json_object"},
    )


def calculate_token_cost(usage: Usage):
    if not usage:
        logging.info("No usage information available")
        return

    prompt_tokens = usage.prompt_tokens
    completion_tokens = usage.completion_tokens
    total_tokens = usage.total_tokens

    # gpt-4o mini
    cost_per_1M_input_tokens = 0.150  # $0.150 per 1M input tokens
    cost_per_1M_output_tokens = 0.600  # $0.600 per 1M output tokens

    input_cost = (prompt_tokens / 1_000_000) * cost_per_1M_input_tokens
    output_cost = (completion_tokens / 1_000_000) * cost_per_1M_output_tokens
    total_cost = input_cost + output_cost

    logging.info(f"Prompt Tokens: {prompt_tokens}")
    logging.info(f"Completion Tokens: {completion_tokens}")
    logging.info(f"Total Tokens: {total_tokens}")
    logging.info(f"Input Cost (USD): ${input_cost:.4f}")
    logging.info(f"Output Cost (USD): ${output_cost:.4f}")
    logging.info(f"Total Cost (USD): ${total_cost:.4f}")


async def query_assistant(file: UploadFile, query: str):
    client = AsyncOpenAI(api_key=openai_api_key)
    assistant = await get_assistant(client)

    file_contents = await file.read()
    file = await client.files.create(
        file=(file.filename, file_contents, file.content_type), purpose="assistants"
    )

    thread = await client.beta.threads.create()
    await client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        attachments=[
            Attachment(
                file_id=file.id, tools=[AttachmentToolFileSearch(type="file_search")]
            )
        ],
        content=query,
    )

    run = await client.beta.threads.runs.create_and_poll(
        thread_id=thread.id, assistant_id=assistant.id
    )

    if run.status != "completed":
        logging.info("Run failed:", run.status)
        raise HTTPException(status_code=500, detail="Error getting schedule")

    message_list = await client.beta.threads.messages.list(
        thread_id=thread.id, run_id=run.id
    )
    messages = [message async for message in message_list]

    response = messages[0].content[0].text.value
    logging.info(response)

    calculate_token_cost(run.usage)

    # file isn't needed anymore
    await client.beta.threads.delete(thread_id=thread.id)
    await client.files.delete(file_id=file.id)

    logging.info("deleted thread and file")

    return response


async def get_schedule(
    file: UploadFile, start_time: datetime, end_time: datetime
) -> Dict[str, str]:
    user_prompt = f"""
        S: {start_time}
        E: {end_time}
    """

    response = await query_assistant(file, user_prompt)

    try:
        response_data = json.loads(response)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error getting schedule")

    return response_data


@router.get("/schedule")
async def schedule_get_endpoint(identity: str) -> Dict[str, Dict[str, str]]:
    if identity not in schedule:
        raise HTTPException(status_code=404, detail="No schedule for today")

    return {"schedule": schedule[identity]}


# TODO add file limit and throttle
# Also make it show all schedules uploaded by all users in frontend


@router.post("/schedule")
async def schedule_post_endpoint(
    file: UploadFile, form_data: ScheduleRequest = Depends()
) -> Dict[str, Dict[str, str]]:
    schedule[form_data.identity] = await get_schedule(
        file, form_data.start_time, form_data.end_time
    )

    return {"schedule": schedule[form_data.identity]}
    return {"schedule": schedule[form_data.identity]}
    return {"schedule": schedule[form_data.identity]}
