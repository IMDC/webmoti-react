import asyncio
import json
from typing import AsyncGenerator, Dict, List, Optional, Tuple

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api")

queue: List[str] = []
queue_event: Optional[asyncio.Event] = None
queue_lock = asyncio.Lock()


# this is for an error when asyncio.Event is created in a different event loop.
# it delays creating it until used so it uses the uvicorn event loop
async def ensure_event() -> None:
    global queue_event
    if queue_event is None:
        queue_event = asyncio.Event()


async def add_to_queue(identity: str) -> Tuple[bool, int]:
    await ensure_event()
    async with queue_lock:
        if identity not in queue:
            queue.append(identity)
            queue_event.set()
            return True, len(queue)
        return False, len(queue)


async def remove_from_queue(identity: str) -> int:
    await ensure_event()
    async with queue_lock:
        if identity in queue:
            queue.remove(identity)
            queue_event.set()
    return await get_queue_length()


async def get_queue_length() -> int:
    async with queue_lock:
        return len(queue)


async def get_queue() -> Dict[str, str]:
    async with queue_lock:
        data = json.dumps(queue.copy())
    return {"data": data}


async def event_generator() -> AsyncGenerator[Dict[str, str], None]:
    await ensure_event()
    # send queue immediately when they connect
    yield await get_queue()

    while True:
        # wait until queue updates
        await queue_event.wait()

        queue_event.clear()
        yield await get_queue()


@router.get("/queue")
async def queue_sse() -> EventSourceResponse:
    return EventSourceResponse(event_generator())
