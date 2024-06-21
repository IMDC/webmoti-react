import logging
from typing import Optional

from constants import HALFWAY_ANGLE, MAX_ANGLE, MIN_ANGLE, Mode
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from routes.queue_sse import add_to_queue
from utils import servo_controller

router = APIRouter(prefix="/api")

is_hand_raised = False


def raise_hand(mode: Mode):
    def wave():
        servo_controller.set_angle(MAX_ANGLE)
        servo_controller.set_angle(MIN_ANGLE)

    global is_hand_raised
    logging.info(f"Raising hand with mode: {mode}")

    if mode == Mode.WAVE2:
        wave()
        wave()

    elif mode == Mode.WAVE:
        wave()

    elif mode == Mode.TOGGLE:
        if is_hand_raised:
            servo_controller.set_angle(MIN_ANGLE)
        else:
            # go farther than halfway so camera isn't blocked
            servo_controller.set_angle(HALFWAY_ANGLE)
        is_hand_raised = not is_hand_raised

    elif mode == Mode.RAISE:
        servo_controller.set_angle(HALFWAY_ANGLE)
        is_hand_raised = True

    elif mode == Mode.LOWER:
        servo_controller.set_angle(MIN_ANGLE)
        is_hand_raised = False

    elif mode == Mode.RERAISE:
        servo_controller.set_angle(MIN_ANGLE)
        servo_controller.set_angle(HALFWAY_ANGLE)

    elif mode == Mode.INIT:
        # this is to initialize the remote.it connection to speed up future requests
        logging.info("Initializing remote.it connection")


class RaiseHandRequest(BaseModel):
    mode: Optional[str] = Mode.WAVE2.name
    identity: str


@router.get("/raisehand")
def wave_hand_endpoint():
    raise_hand(Mode.WAVE)
    return {"status": "Hand waved"}


# these endpoints aren't async because they deal with hardware
# and we don't want multiple requests at the same time


@router.post("/raisehand")
def raise_hand_endpoint(request: RaiseHandRequest):
    mode = request.mode.upper()
    identity = request.identity

    try:
        mode_enum = Mode[mode]
    except KeyError:
        logging.error(f"Invalid mode received: {mode}")
        raise HTTPException(status_code=400, detail="Invalid mode")

    if mode_enum == Mode.RAISE:
        add_to_queue(identity)

    raise_hand(mode_enum)
    return {"status": "Hand raised", "mode": mode_enum.name}
