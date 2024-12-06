import logging
import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from livekit import api, rtc

from core.models import TokenRequest

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_SERVER_URL = os.getenv("LIVEKIT_SERVER_URL")
if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET or not LIVEKIT_SERVER_URL:
    raise RuntimeError(
        "LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_SERVER_URL must be set."
    )


ROOM_NAME = "Classroom"


@asynccontextmanager
async def lifespan(_: FastAPI):
    # create room on startup
    await create_room(ROOM_NAME)

    yield

    # close all peer connections
    # coros = [pc.close() for pc in pcs]
    # await asyncio.gather(*coros)
    # pcs.clear()


router = APIRouter(prefix="/api", lifespan=lifespan)


async def create_room(room_name: str) -> rtc.Room:
    lkapi = api.LiveKitAPI(LIVEKIT_SERVER_URL)
    try:
        room = await lkapi.room.create_room(
            api.CreateRoomRequest(name=room_name, max_participants=100)
        )
        logging.info("Created livekit classroom")
        await lkapi.aclose()
        return room
    except Exception as e:
        print(e)
        await lkapi.aclose()
        raise e


def generate_token(user_id: str, room_admin=False) -> dict:
    # TODO check if user_id is in room already

    video_grants = api.VideoGrants(
        room=ROOM_NAME,
        room_join=True,
        # clients don't need to hear audio, just publish it
        can_subscribe=False,
        # audio only
        can_publish_sources=["microphone"],
    )
    if room_admin:
        video_grants.room_admin = True
        video_grants.can_subscribe = True
        video_grants.hidden = True

    token = (
        api.AccessToken(api_key=LIVEKIT_API_KEY, api_secret=LIVEKIT_API_SECRET)
        .with_identity(user_id)
        .with_name(user_id)
        .with_grants(video_grants)
        .to_jwt()
    )

    return {"token": token, "room_name": ROOM_NAME}


@router.post("/get-token")
async def get_token(request: TokenRequest):
    return generate_token(request.id, ROOM_NAME)
