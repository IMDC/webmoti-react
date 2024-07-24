from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from fastapi import Form
from pydantic import BaseModel


class RaiseHandRequest(BaseModel):
    mode: str
    identity: Optional[str] = None


class TTSRequest(BaseModel):
    text: str


@dataclass
class ScheduleRequest:
    password: str = Form(...)
    start_time: datetime = Form(...)
    end_time: datetime = Form(...)
