import json
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from core.models import ScheduleRequest

router = APIRouter(prefix="/api")

password = os.getenv("PASSWORD")


def get_schedule(text: str, start_time: datetime, end_time: datetime):
    example_prompt = f"""
        Please analyze the class notes and times provided and generate a schedule in 
        JSON format without any other text output. The schedule should have a number of 
        topics based on the length of the notes.

        Output format:
        {{
            "title": "<title based on notes>",
            "<time 1 in 24h>": "<topic1>",
            "<time 2>": "<topic2>",
            "...": "...",
            "...": "...",
            "...": "..."
        }}

        Start Time: {start_time}
        End Time: {end_time}
        Notes: {text}
    """

    # TODO send prompt to chatgpt

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


@router.post("/schedule")
async def schedule_endpoint(file: UploadFile, form_data: ScheduleRequest = Depends()):
    if form_data.password != password:
        raise HTTPException(status_code=401, detail="Invalid password")

    file_text = await file.read()

    schedule = get_schedule(file_text, form_data.start_time, form_data.end_time)

    return {"schedule": schedule}
