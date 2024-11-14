import asyncio
import logging
from contextlib import asynccontextmanager

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaRecorder
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

pcs = set()


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield

    # close all peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


router = APIRouter(prefix="/api", lifespan=lifespan)


# this is adapted from:
# https://github.com/aiortc/aiortc/blob/main/examples/server/server.py
@router.post("/offer")
async def offer(request: Request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    logging.info("Received offer from client with SDP type: %s", offer.type)

    pc = RTCPeerConnection()
    pcs.add(pc)
    logging.info("Created new RTCPeerConnection, total connections: %d", len(pcs))

    # recorder = MediaBlackhole()
    recorder = MediaRecorder("output.wav")

    @pc.on("track")
    def on_track(track):
        logging.info("Track received: %s", track.kind)
        if track.kind == "audio":
            recorder.addTrack(track)

        @track.on("ended")
        async def on_ended():
            logging.info("Track ended: %s", track.kind)
            await recorder.stop()

    await pc.setRemoteDescription(offer)
    await recorder.start()
    logging.info("Recorder started")

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    logging.info("Created and set local SDP answer")

    return JSONResponse(
        content={"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    )
