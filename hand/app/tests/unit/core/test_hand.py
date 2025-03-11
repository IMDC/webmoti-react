import json
from unittest.mock import AsyncMock, MagicMock

import pytest
from pytest_mock import MockFixture

from core.constants import HALFWAY_ANGLE, HALFWAY_SLEEP_TIME, MIN_ANGLE, Mode
from core.hand import process_hand_request, raise_hand, raised_hands, timers
from core.models import RaiseHandRequest
from routes.queue_sse import get_queue, remove_from_queue


# reset queue before each test
@pytest.fixture(autouse=True)
async def reset_queue():
    queue_json = await get_queue()
    queue_data = queue_json["data"]
    current_queue = json.loads(queue_data)
    for identity in current_queue:
        await remove_from_queue(identity)


@pytest.fixture(autouse=True)
def reset_hands_and_timers():
    raised_hands.clear()
    for task in timers.values():
        task.cancel()
    timers.clear()


@pytest.fixture
def mock_servo_controller(mocker: MockFixture) -> MagicMock:
    mock_controller = mocker.patch("core.hand.servo_controller", autospec=True)
    mock_controller.set_angle = AsyncMock()
    mock_controller.set_angle_twice = AsyncMock()
    return mock_controller


@pytest.fixture
def mock_add_to_queue(mocker: MockFixture) -> AsyncMock:
    return mocker.patch("core.hand.add_to_queue", new_callable=AsyncMock)


@pytest.fixture
def mock_raise_hand(mocker: MockFixture) -> AsyncMock:
    return mocker.patch("core.hand.raise_hand", new_callable=AsyncMock)


@pytest.fixture
def mock_send_notification(mocker: MockFixture) -> AsyncMock:
    return mocker.patch("core.hand.send_notification", new_callable=AsyncMock)


@pytest.fixture
def mock_remove_from_queue(mocker: MockFixture) -> AsyncMock:
    return mocker.patch("core.hand.remove_from_queue", new_callable=AsyncMock)


@pytest.mark.anyio
async def test_raise_hand_init(mock_servo_controller: MagicMock) -> None:
    # init mode shouldn't do anything
    await raise_hand(Mode.INIT)

    mock_servo_controller.set_angle.assert_not_called()
    mock_servo_controller.set_angle_twice.assert_not_called()


@pytest.mark.anyio
async def test_raise_hand_raise(mock_servo_controller: MagicMock) -> None:
    await raise_hand(Mode.RAISE)

    mock_servo_controller.set_angle.assert_called_once_with(
        HALFWAY_ANGLE, HALFWAY_SLEEP_TIME
    )


@pytest.mark.anyio
async def test_raise_hand_lower(mock_servo_controller: MagicMock) -> None:
    # servo controller should set hand to raised then lower it
    await raise_hand(Mode.RAISE)
    mock_servo_controller.set_angle.assert_called_with(
        HALFWAY_ANGLE, HALFWAY_SLEEP_TIME
    )

    await raise_hand(Mode.LOWER)
    mock_servo_controller.set_angle.assert_called_with(MIN_ANGLE, HALFWAY_SLEEP_TIME)

    assert mock_servo_controller.set_angle.call_count == 2


@pytest.mark.anyio
async def test_process_hand_request_raise(
    mock_add_to_queue: AsyncMock,
    mock_send_notification: AsyncMock,
    mock_raise_hand: AsyncMock,
) -> None:
    # user should be able to raise hand
    mock_add_to_queue.return_value = (True, 1)

    request = RaiseHandRequest(mode="RAISE", identity="user")
    error = await process_hand_request(request)

    mock_raise_hand.assert_called_once_with(Mode.RAISE)
    assert error is None

    mock_add_to_queue.assert_called_once_with("user")
    mock_send_notification.assert_called_once_with("user")


@pytest.mark.anyio
async def test_process_hand_request_invalid_mode():
    # if mode is invalid, it should have an error
    request = RaiseHandRequest(mode="INVALID_MODE", identity="user")
    error = await process_hand_request(request)

    assert error is not None


@pytest.mark.anyio
async def test_process_hand_request_lower(
    mock_remove_from_queue: AsyncMock, mock_raise_hand: AsyncMock
):
    # user should be able to lower hand
    mock_remove_from_queue.return_value = 0

    request = RaiseHandRequest(mode="RAISE", identity="user")
    await process_hand_request(request)

    request = RaiseHandRequest(mode="LOWER", identity="user")
    error = await process_hand_request(request)

    assert error is None

    mock_raise_hand.assert_called_with(Mode.LOWER)

    mock_remove_from_queue.assert_called_with("user")


@pytest.mark.anyio
async def test_process_hand_request_lower_fail():
    # hand shouldn't lower if it isn't raised
    request = RaiseHandRequest(mode="LOWER", identity="user")
    error = await process_hand_request(request)

    assert error is not None


@pytest.mark.anyio
async def test_process_hand_request_lower_return(mock_raise_hand: AsyncMock):
    # mode should change from lower to lower_return if queue isn't empty

    # first raise
    request = RaiseHandRequest(mode="RAISE", identity="user1")
    await process_hand_request(request)

    # second raise
    request = RaiseHandRequest(mode="RAISE", identity="user2")
    await process_hand_request(request)

    # user2 lowers hand
    request = RaiseHandRequest(mode="LOWER", identity="user2")
    error = await process_hand_request(request)

    assert error is None

    mock_raise_hand.assert_called_with(Mode.LOWER_RETURN)
