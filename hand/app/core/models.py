from dataclasses import dataclass
from typing import Optional

from fastapi import Form
from pydantic import BaseModel


class RaiseHandRequest(BaseModel):
    """Client request to /raisehand"""

    mode: str
    identity: Optional[str] = None


class TTSRequest(BaseModel):
    """Client request to /tts"""

    text: str


class CaptionData(BaseModel):
    """Websocket JSON caption to /ws/captions"""

    type: str
    transcript: str
    id: int


class CaptionActionData(BaseModel):
    """Websocket JSON caption command to /ws/captions"""

    type: str
    action: str


@dataclass
class ScheduleRequest:
    """Client request data for /schedule"""

    identity: str = Form(...)
    # format is HH:MM 24h
    start_time: str = Form(...)
    end_time: str = Form(...)
