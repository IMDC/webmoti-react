import logging
from typing import Optional, Tuple

from constants import HALFWAY_ANGLE, MAX_ANGLE, MIN_ANGLE, Mode
from core.servo_controller import servo_controller
from models import RaiseHandRequest
from routes.notifications import send_notification
from routes.queue_sse import add_to_queue, remove_from_queue


async def raise_hand(mode: Mode):
    async def wave():
        await servo_controller.set_angle_twice(MAX_ANGLE, MIN_ANGLE)

    logging.info(f"Raising hand with mode: {mode}")

    if mode == Mode.WAVE2:
        await wave()
        await wave()

    elif mode == Mode.WAVE:
        await wave()

    elif mode == Mode.TOGGLE:
        is_hand_raised = servo_controller.is_hand_raised
        if is_hand_raised:
            await servo_controller.set_angle(MIN_ANGLE)
        else:
            # go farther than halfway so camera isn't blocked
            await servo_controller.set_angle(HALFWAY_ANGLE)
        servo_controller.is_hand_raised = not is_hand_raised

    elif mode == Mode.RAISE:
        await servo_controller.set_angle(HALFWAY_ANGLE)
        servo_controller.is_hand_raised = True

    elif mode == Mode.LOWER:
        await servo_controller.set_angle(MIN_ANGLE)
        servo_controller.is_hand_raised = False

    elif mode == Mode.RERAISE:
        await servo_controller.set_angle_twice(MIN_ANGLE, HALFWAY_ANGLE)

    elif mode == Mode.INIT:
        # this is to initialize the remote.it connection to speed up future requests
        logging.info("Initializing remote.it connection")


async def process_hand_request(
    request: RaiseHandRequest,
) -> Tuple[Optional[Mode], Optional[str]]:
    mode = request.mode.upper()
    identity = request.identity

    try:
        mode_enum = Mode[mode]
    except KeyError:
        logging.error(f"Invalid mode received: {mode}")
        return None, "Invalid mode"

    if (mode_enum in [Mode.RAISE, Mode.LOWER]) and not identity:
        return None, f"Identity is required for mode: {mode}"

    if (
        mode_enum in [Mode.WAVE, Mode.WAVE2, Mode.TOGGLE]
        and servo_controller.is_hand_raised
    ):
        return None, f"Can't {mode_enum} while hand is raised"

    if mode_enum == Mode.RERAISE:
        return None, "RERAISE mode not allowed"

    if mode_enum == Mode.RAISE:
        success = await add_to_queue(identity)
        if success:
            await send_notification(identity)
        else:
            # don't raise hand if already raised
            return None, "Hand is already raised"

    elif mode_enum == Mode.LOWER:
        if not servo_controller.is_hand_raised:
            return None, "Hand isn't raised"

        queue_length = await remove_from_queue(identity)
        if queue_length > 0:
            mode_enum = Mode.RERAISE

    return mode_enum, None
