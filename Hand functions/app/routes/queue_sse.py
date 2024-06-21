import asyncio
import json

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api")

queue = []
queue_event = asyncio.Event()


def add_to_queue(identity: str):
    if identity not in queue:
        queue.append(identity)
        queue_event.set()


def remove_from_queue(identity: str):
    if identity in queue:
        queue.remove(identity)
        queue_event.set()
    return len(queue)


def get_queue():
    data = json.dumps(queue.copy())
    return {"data": data}


async def event_generator():
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
