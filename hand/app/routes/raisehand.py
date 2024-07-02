import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from constants import Mode
from routes.notifications import send_notification
from routes.queue_sse import add_to_queue, remove_from_queue
from utils import raise_hand, servo_controller

router = APIRouter(prefix="/api")


class RaiseHandRequest(BaseModel):
    mode: str
    identity: Optional[str] = None


@router.get("/raisehand")
async def wave_hand_endpoint():
    raise_hand(Mode.WAVE)
    return {"status": "Hand waved"}


# TODO lock these to one at a time


@router.post("/raisehand")
async def raise_hand_endpoint(request: RaiseHandRequest):
    mode = request.mode.upper()
    identity = request.identity

    try:
        mode_enum = Mode[mode]
    except KeyError:
        logging.error(f"Invalid mode received: {mode}")
        raise HTTPException(status_code=400, detail="Invalid mode")

    if (mode_enum in [Mode.RAISE, Mode.LOWER]) and not request.identity:
        raise HTTPException(
            status_code=400, detail=f"Identity is required for mode: {mode}"
        )

    if (
        mode_enum in [Mode.WAVE, Mode.WAVE2, Mode.TOGGLE]
        and servo_controller.is_hand_raised
    ):
        raise HTTPException(
            status_code=400, detail=f"Can't {mode_enum} while hand is raised"
        )

    if mode_enum == Mode.RERAISE:
        raise HTTPException(status_code=400, detail=f"RERAISE mode not allowed")

    if mode_enum == Mode.RAISE:
        success = await add_to_queue(identity)
        if success:
            await send_notification(identity)
        else:
            # don't raise hand if already raised
            raise HTTPException(status_code=400, detail="Hand is already raised")

    elif mode_enum == Mode.LOWER:
        if not servo_controller.is_hand_raised:
            raise HTTPException(status_code=400, detail="Hand isn't raised")

        queue_length = await remove_from_queue(identity)
        # if there are still people in the queue, reraise
        if queue_length > 0:
            mode_enum = Mode.RERAISE

    await raise_hand(mode_enum)

    return JSONResponse(content={"message": "OK"}, status_code=200)
