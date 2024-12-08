import logging
import os
import threading
from contextlib import asynccontextmanager
from uuid import uuid4

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

unmuted_tracks = []
lock = threading.Lock()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # create and join room on startup
    await create_room(ROOM_NAME)
    await join_room()

    yield

    # close all peer connections
    # coros = [pc.close() for pc in pcs]
    # await asyncio.gather(*coros)
    # pcs.clear()


router = APIRouter(prefix="/api", lifespan=lifespan)


async def join_room():
    room = rtc.Room()

    @room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        _publication: rtc.RemoteTrackPublication,
        _participant: rtc.RemoteParticipant,
    ):
        if not track.muted:
            with lock:
                unmuted_tracks.append(track)
                print(unmuted_tracks)

    @room.on("track_unmuted")
    def on_track_unmuted(_: rtc.Participant, publication: rtc.TrackPublication) -> None:
        with lock:
            unmuted_tracks.append(publication.track)
            print(unmuted_tracks)

    @room.on("track_muted")
    def on_track_muted(_: rtc.Participant, publication: rtc.TrackPublication) -> None:
        with lock:
            unmuted_tracks.remove(publication.track)
            print(unmuted_tracks)

    id = uuid4()
    token = generate_token(str(id), room_admin=True)
    await room.connect(LIVEKIT_SERVER_URL, token["token"])
    logging.info("Connected to classroom")


async def create_room(room_name: str) -> rtc.Room:
    lkapi = api.LiveKitAPI(LIVEKIT_SERVER_URL)
    try:
        room = await lkapi.room.create_room(
            api.CreateRoomRequest(
                name=room_name,
                max_participants=100,
                # empty_timeout=0,
                # close room instantly after last participant (this one) leaves
                # departure_timeout=1,
            )
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
