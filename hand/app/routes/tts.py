import os

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core.models import TTSRequest

router = APIRouter(prefix="/api")


elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")

CHUNK_SIZE = 1024


@router.post("/tts")
async def tts_endpoint(request: TTSRequest) -> StreamingResponse:
    if elevenlabs_api_key is None:
        raise HTTPException(status_code=500, detail="Missing api key")

    # Matilda voice
    voice_id = "XrExE9yKIg1WjnnlVkGX"
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
