import os

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core.models import TTSRequest
from core.utils import is_pytest_running

router = APIRouter(prefix="/api")


elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
if not is_pytest_running() and not elevenlabs_api_key:
    raise RuntimeError("Missing environment variable: ELEVENLABS_API_KEY")


CHUNK_SIZE = 1024


VOICE_MAP = {
    "MATILDA": "XrExE9yKIg1WjnnlVkGX",
    "ROGER": "CwhRBWXzGAHq8TQ4Fs17",
    "SARAH": "EXAVITQu4vr4xnSDxMaL",
    "CHARLIE": "IKne3meq5aSn9XLyUdCD",
    "CALLUM": "N2lVS1w4EtoT3dr4eOWO",
    "RIVER": "SAz9YHcvj6GT2YYXdXww",
    "LIAM": "TX3LPaxmHKxFdv7VOQHJ",
    "ALICE": "Xb7hH8MSUJpSbSDYk0k2",
    "CHRIS": "iP95p4xoKVk53GoZ742B",
    "LILY": "pFZP5JQG7iQjIQuC4Bku",
}


@router.post("/tts")
async def tts_endpoint(request: TTSRequest) -> StreamingResponse:
    if elevenlabs_api_key is None:
        raise HTTPException(status_code=500, detail="Missing api key")

    # default is matilda if not found
    voice_id = VOICE_MAP.get(request.voice, VOICE_MAP["MATILDA"])
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenlabs_api_key,
    }

    data = {
        "text": request.text,
        "model_id": "eleven_turbo_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)

        async def response_generator():
            async for chunk in response.aiter_bytes(chunk_size=CHUNK_SIZE):
                yield chunk

        return StreamingResponse(response_generator(), media_type="audio/mpeg")
