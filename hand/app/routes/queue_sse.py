import asyncio
import json

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api")

queue = []
queue_event = None


# this is for an error when asyncio.Event is created in a different event loop.
# it delays creating it until used so it uses the uvicorn event loop
async def ensure_event():
    global queue_event
    if queue_event is None:
        queue_event = asyncio.Event()


async def add_to_queue(identity: str):
    await ensure_event()
    if identity not in queue:
        queue.append(identity)
        queue_event.set()


async def remove_from_queue(identity: str):
    await ensure_event()
    if identity in queue:
        queue.remove(identity)
        queue_event.set()
    return len(queue)


def get_queue():
    data = json.dumps(queue.copy())
    return {"data": data}


async def event_generator():
    await ensure_event()
    # send queue immediately when they connect
    yield get_queue()

    while True:
        # wait until queue updates
        await queue_event.wait()

        queue_event.clear()
        yield get_queue()


@router.get("/queue")
async def queue_sse():
    return EventSourceResponse(event_generator())
