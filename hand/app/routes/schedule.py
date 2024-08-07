import json
import os
import textwrap
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from openai import OpenAI

from core.models import ScheduleRequest

router = APIRouter(prefix="/api")

openai_api_key = os.getenv("OPENAI_API_KEY")

# identity to schedule
schedule: Dict[str, Dict[str, str]] = {}

# client = OpenAI(api_key=openai_api_key)


def get_system_prompt():
    system_prompt = f"""
        Please analyze the class notes and times provided and generate a schedule in 
        JSON format without any other text output. The schedule should have a number of 
        topics based on the length of the notes. Set topic times based on the depth and 
        complexity of the content, allocating more time to denser topics rather than 
        distributing time evenly. Some topics may be hands on or demonstrations with 
        few words and will need a longer time.

        Output format:
        {{
            "title": "<title based on notes>",
            "<time 1 in 24h>": "<topic1>",
            "<time 2>": "<topic2>",
            "...": "...",
            "...": "...",
            "...": "..."
        }}
    """
    return textwrap.dedent(system_prompt)


def get_schedule(
    file: UploadFile, start_time: datetime, end_time: datetime
) -> Dict[str, str]:
    system_prompt = get_system_prompt()

    user_prompt = f"""
        Start Time: {start_time}
        End Time: {end_time}
    """

    # completion = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     response_format={"type": "json_object"},
    #     messages=[
    #         {"role": "system", "content": system_prompt},
    #         {"role": "user", "content": user_prompt},
    #     ],
    # )
    # response = completion.choices[0].message.content

    # make assistant and vector store
    # assistant = client.beta.assistants.create(
    #     name="Class Schedule Analyzer",
    #     instructions=system_prompt,
    #     model="gpt-4o-mini",
    #     tools=[{"type": "file_search"}],
    #     response_format={"type": "json_object"},
    # )
    # vector_store = client.beta.vector_stores.create(name="Class Notes")
    # assistant = client.beta.assistants.update(
    #     assistant_id=assistant.id,
    #     tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
    # )

    # # make request with file and text
    # notes_file = client.files.create(
    #     file=open(file.filename, "rb"), purpose="assistants"
    # )
    # thread = client.beta.threads.create(
    #     messages=[
    #         {
    #             "role": "user",
    #             "content": user_prompt,
    #             "attachments": [
    #                 {"file_id": notes_file.id, "tools": [{"type": "file_search"}]}
    #             ],
    #         }
    #     ]
    # )

    # # send request
    # run = client.beta.threads.runs.create_and_poll(
    #     thread_id=thread.id, assistant_id=assistant.id
    # )
    # messages = list(
    #     client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id)
    # )
    # response = messages[0].content[0].text

    # # delete vector store because files aren't needed now
    # deleted_vector_store = client.beta.vector_stores.delete(
    #     vector_store_id=vector_store.id
    # )

    example_response = json.dumps(
        {
            "title": "Eigenvalues and Eigenvectors",
            "10:00": "Introduction to Eigenvalues and Eigenvectors",
            "10:15": "Definition and Importance of Eigenvectors and Eigenvalues",
            "10:30": "Example: Checking if Vectors are Eigenvectors",
            "10:45": "Example: Eigenvalue and Eigenvector Computation",
            "11:00": "General Procedure to Find Eigenvectors",
            "11:15": "Example: Finding a Basis for Eigenspace",
            "11:30": "Properties of Eigenvectors with Distinct Eigenvalues",
            "11:45": "Implications of Zero Eigenvalues",
        }
    )

    response_data = json.loads(example_response)

    return response_data


@router.get("/schedule")
async def schedule_get_endpoint(identity: str) -> Dict[str, Dict[str, str]]:
    if identity not in schedule:
        raise HTTPException(status_code=404, detail="No schedule for today")

    return {"schedule": schedule[identity]}


@router.post("/schedule")
async def schedule_post_endpoint(
    file: UploadFile, form_data: ScheduleRequest = Depends()
) -> Dict[str, Dict[str, str]]:

    # file_text = await file.read()

    schedule[form_data.identity] = get_schedule(
        file, form_data.start_time, form_data.end_time
    )

    return {"schedule": schedule[form_data.identity]}
