# import asyncio
# import logging
import os

# import threading
from contextlib import asynccontextmanager

# from uuid import uuid4
# import numpy as np
# import soundcard
from fastapi import APIRouter, FastAPI
from livekit import api

from core.models import TokenRequest
from core.utils import is_pytest_running

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_SERVER_URL = os.getenv("LIVEKIT_SERVER_URL")
if not is_pytest_running() and (
    not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET or not LIVEKIT_SERVER_URL
):
    raise RuntimeError(
        "LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_SERVER_URL must be set."
    )


ROOM_NAME = "Classroom"

# unmuted_tracks = []
# lock = threading.Lock()
# unmuted_track_event = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    if is_pytest_running():
        # during testing, it won't have livekit env variables
        yield
        return

    # create and join room on startup
    # await create_room(ROOM_NAME)
    # await join_room()

    # make sure event is in same event loop
    # global unmuted_track_event
    # unmuted_track_event = asyncio.Event()

    # virtual_mic_sink = soundcard.get_speaker("webmoti_source")
    # virtual_mic_player = virtual_mic_sink.player(samplerate=48000)
    # with virtual_mic_player:
    #     audio_task = asyncio.create_task(audio_processing_loop(virtual_mic_player))

    yield

    # await delete_room(ROOM_NAME)

    # audio_task.cancel()
    # try:
    #     await audio_task
    # except asyncio.CancelledError:
    #     pass


# @asynccontextmanager
# async def livekit_client():
#     lkapi = api.LiveKitAPI(LIVEKIT_SERVER_URL)
#     try:
#         yield lkapi
#     finally:
#         await lkapi.aclose()


router = APIRouter(prefix="/api", lifespan=lifespan)


# async def audio_processing_loop(virtual_mic_player):
#     audio_stream = None

#     while True:
#         # wait until unmuted track
#         await unmuted_track_event.wait()

#         with lock:
#             active_track = unmuted_tracks[0] if unmuted_tracks else None

#         if active_track is None:
#             # this shouldn't happen
#             unmuted_track_event.clear()
#             continue

#         print("active track")

#         if not audio_stream:
#             print("made new audio stream")
#             audio_stream = rtc.AudioStream.from_track(track=active_track)

#         try:
#             async for event in audio_stream:
#                 with lock:
#                     if active_track not in unmuted_tracks:
#                         print("track muted, stopping processing")
#                         audio_stream = None
#                         unmuted_track_event.clear()
#                         break

#                 audio_frame = event.frame
#                 np_audio_data = np.frombuffer(audio_frame.data, dtype=np.int16)

#                 # TODO remove this
#                 # assert virtual_mic_sink.channels == audio_frame.num_channels
#                 # assert virtual_mic_sink.samplerate == audio_frame.sample_rate

#                 virtual_mic_player.play(np_audio_data)

#             print("done, no events")
#         except Exception as e:
#             logging.error(f"Error processing audio from track: {e}")
#             audio_stream = None


# async def join_room():
#     room = rtc.Room()

#     @room.on("track_subscribed")
#     def on_track_subscribed(
#         track: rtc.Track,
#         _publication: rtc.RemoteTrackPublication,
#         _participant: rtc.RemoteParticipant,
#     ):
#         if not track.muted:
#             with lock:
#                 unmuted_tracks.append(track)
#                 unmuted_track_event.set()
#                 print(unmuted_tracks)

#     @room.on("track_unmuted")
#     def on_track_unmuted(_: rtc.Participant, publication: rtc.TrackPublication) -> None:
#         with lock:
#             unmuted_tracks.append(publication.track)
#             unmuted_track_event.set()
#             print(unmuted_tracks)

#     @room.on("track_muted")
#     def on_track_muted(_: rtc.Participant, publication: rtc.TrackPublication) -> None:
#         with lock:
#             unmuted_tracks.remove(publication.track)
#             # only clear event when there are no more unmuted tracks
#             if not unmuted_tracks:
#                 unmuted_track_event.clear()
#             print(unmuted_tracks)

#     id = uuid4()
#     token = generate_token(str(id), room_admin=True)
#     await room.connect(LIVEKIT_SERVER_URL, token["token"])
#     logging.info("Connected to classroom")


# async def create_room(room_name: str) -> rtc.Room:
#     async with livekit_client() as lkapi:
#         try:
#             room = await lkapi.room.create_room(
#                 api.CreateRoomRequest(
#                     name=room_name,
#                     max_participants=100,
#                     empty_timeout=300,
#                     # close room 1min after last participant leaves
#                     departure_timeout=60,
#                 )
#             )
#             logging.info("Created livekit classroom")
#             return room
#         except Exception as e:
#             logging.error(f"Error creating room: {e}")
#             raise


# async def delete_room(room_name: str):
#     async with livekit_client() as lkapi:
#         await lkapi.room.delete_room(api.DeleteRoomRequest(room=room_name))


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
