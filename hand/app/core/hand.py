import asyncio
import logging
from collections import defaultdict
from typing import Dict, Optional, Tuple

from core.constants import (
    FULL_SLEEP_TIME,
    HALFWAY_ANGLE,
    HALFWAY_HIGHER_ANGLE,
    HALFWAY_LOWER_ANGLE,
    HALFWAY_SLEEP_TIME,
    MAX_ANGLE,
    MIN_ANGLE,
    SMALL_SLEEP_TIME,
    Mode,
)
from core.models import RaiseHandRequest
from core.servo_controller import servo_controller
from routes.notifications import send_notification
from routes.queue_sse import add_to_queue, remove_from_queue

# 5 minutes
HAND_TIMEOUT_SECONDS = 300

raised_hands: Dict[str, bool] = defaultdict(lambda: False)
timers: Dict[str, asyncio.Task] = {}


async def expire_hand(identity: str) -> None:
    if not raised_hands[identity]:
        # hand is already lowered, skip
        return

    raised_hands[identity] = False
    if identity in timers:
        del timers[identity]

    # lower the physical hand
    queue_length = await remove_from_queue(identity)
    if queue_length >= 0:
        await raise_hand(get_lower_mode(queue_length))

    logging.info(f"Timer expired for {identity}")


async def reset_hand_task(identity: str) -> None:
    try:
        await asyncio.sleep(HAND_TIMEOUT_SECONDS)
        await expire_hand(identity)
    except asyncio.CancelledError:
        logging.debug(f"Timer for {identity} was canceled")


def start_reset_timer(identity: str) -> None:
    raised_hands[identity] = True

    # cancel any existing timer
    if identity in timers:
        timers[identity].cancel()
        del timers[identity]

    # run timer
    task = asyncio.create_task(reset_hand_task(identity))
    timers[identity] = task


def stop_reset_timer(identity: str):
    # cancel task
    if identity in timers:
        timers[identity].cancel()
        del timers[identity]

    if identity in raised_hands:
        raised_hands[identity] = False


async def raise_hand(mode: Mode) -> None:
    async def wave() -> None:
        await servo_controller.set_angle_twice(MAX_ANGLE, MIN_ANGLE, FULL_SLEEP_TIME)

    logging.info(f"Raising hand with mode: {mode}")

    if mode == Mode.WAVE2:
        await wave()
        await wave()

    elif mode == Mode.WAVE:
        await wave()

    elif mode == Mode.RAISE:
        # go farther than halfway so camera isn't blocked
        await servo_controller.set_angle(HALFWAY_ANGLE, HALFWAY_SLEEP_TIME)

    elif mode == Mode.LOWER:
        await servo_controller.set_angle(MIN_ANGLE, HALFWAY_SLEEP_TIME)

    elif mode == Mode.LOWER_RETURN:
        # this should lower it a small amount, then go back to raised
        # to show that there are still people in queue
        await servo_controller.set_angle_twice(
            HALFWAY_LOWER_ANGLE, HALFWAY_ANGLE, SMALL_SLEEP_TIME
        )

    elif mode == Mode.RAISE_RETURN:
        await servo_controller.set_angle_twice(
            HALFWAY_HIGHER_ANGLE, HALFWAY_ANGLE, SMALL_SLEEP_TIME
        )

    elif mode == Mode.INIT:
        # this is to initialize the remote.it connection to speed up future requests
        logging.info("Initializing remote.it connection")


def get_raise_mode(queue_length: int) -> Mode:
    return Mode.RAISE if queue_length == 0 else Mode.RAISE_RETURN


def get_lower_mode(queue_length: int) -> Mode:
    return Mode.LOWER if queue_length == 0 else Mode.LOWER_RETURN


async def validate_request(
    mode: str, identity: Optional[str], raised_hands: Dict[str, bool]
) -> Tuple[Optional[Mode], Optional[str]]:
    try:
        mode_enum = Mode[mode.upper()]
    except KeyError:
        logging.error(f"Invalid mode received: {mode}")
        return None, "Invalid mode"

    if mode_enum in [Mode.RAISE, Mode.LOWER] and not identity:
        return None, f"Identity is required for mode: {mode}"

    if mode_enum in [Mode.WAVE, Mode.WAVE2] and any(raised_hands.values()):
        return None, f"Can't {mode_enum} while hand is raised"

    if mode_enum in [Mode.RAISE_RETURN, Mode.LOWER_RETURN]:
        return None, "Mode not allowed"

    return mode_enum, None


async def handle_raise(
    identity: str, raised_hands: Dict[str, bool]
) -> Tuple[Optional[Mode], Optional[str]]:
    if raised_hands[identity]:
        return None, f"Hand is already raised for {identity}"

    success, queue_length = await add_to_queue(identity)
    if success:
        logging.info(f"Hand raised for {identity}")
        start_reset_timer(identity)
        await send_notification(identity)
        return get_raise_mode(queue_length), None
    return None, "Hand is already raised"


async def handle_lower(
    identity: str, raised_hands: Dict[str, bool]
) -> Tuple[Optional[Mode], Optional[str]]:
    if not raised_hands[identity]:
        return None, f"Hand isn't raised for {identity}"

    queue_length = await remove_from_queue(identity)
    if queue_length < 0:
        logging.error(f"Failed to remove {identity} from queue on timer expiration")
        return

    await raise_hand(get_lower_mode(queue_length))
    logging.info(f"Timer expired for {identity}")


async def process_hand_request(
    request: RaiseHandRequest,
) -> Tuple[Optional[Mode], Optional[str]]:
    mode = request.mode
    identity = request.identity

    mode_enum, error = await validate_request(mode, identity, raised_hands)
    if error:
        return None, error

    if mode_enum == Mode.RAISE:
        return await handle_raise(identity, raised_hands)
    elif mode_enum == Mode.LOWER:
        return await handle_lower(identity, raised_hands)

    return mode_enum, None
