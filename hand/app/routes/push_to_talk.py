import os

from fastapi import APIRouter
from livekit import api

from core.models import TokenRequest
from core.utils import is_pytest_running

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
if not is_pytest_running() and (not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET):
    raise RuntimeError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set.")


ROOM_NAME = "Classroom"


router = APIRouter(prefix="/api")


def generate_token(user_id: str, room_admin=False) -> dict:
    # TODO check if user_id is in room already

    video_grants = api.VideoGrants(
        room=ROOM_NAME,
        room_join=True,
        # clients don't need to hear audio, just publish it
        # can_subscribe=False,
        # audio only
        can_publish_sources=["microphone"],
    )
    if room_admin:
        video_grants.room_admin = True
        video_grants.can_subscribe = True
        # video_grants.can_publish = False
        # this causes error
        # video_grants.hidden = True

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
