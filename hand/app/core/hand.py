import logging
from typing import Optional, Tuple

from core.constants import (
    HALFWAY_ANGLE,
    HALFWAY_HIGHER_ANGLE,
    HALFWAY_LOWER_ANGLE,
    MAX_ANGLE,
    MIN_ANGLE,
    Mode,
)
from core.models import RaiseHandRequest
from core.servo_controller import servo_controller
from routes.notifications import send_notification
from routes.queue_sse import add_to_queue, get_queue_length, remove_from_queue


async def raise_hand(mode: Mode) -> None:
    async def wave() -> None:
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

    elif mode == Mode.LOWER_RETURN:
        # this should lower it a small amount, then go back to raised
        # to show that there are still people in queue
        await servo_controller.set_angle_twice(
            HALFWAY_LOWER_ANGLE, HALFWAY_ANGLE, sleep_time=0.1
        )

    elif mode == Mode.RAISE_RETURN:
        await servo_controller.set_angle_twice(
            HALFWAY_HIGHER_ANGLE, HALFWAY_ANGLE, sleep_time=0.1
        )

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

    if mode_enum == Mode.RAISE_RETURN or mode_enum == Mode.LOWER_RETURN:
        return None, "Mode not allowed"

    if mode_enum == Mode.RAISE:
        if get_queue_length() > 0:
            mode_enum = Mode.RAISE_RETURN

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
            mode_enum = Mode.LOWER_RETURN

    return mode_enum, None
