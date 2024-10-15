from unittest.mock import AsyncMock, MagicMock

import pytest
from pytest_mock import MockFixture

from core.constants import HALFWAY_ANGLE, MIN_ANGLE, Mode
from core.hand import process_hand_request, raise_hand
from core.models import RaiseHandRequest


@pytest.fixture
def mock_servo_controller(mocker: MockFixture) -> MagicMock:
    mock_controller = mocker.patch("core.hand.servo_controller", autospec=True)
    mock_controller.set_angle = AsyncMock()
    mock_controller.set_angle_twice = AsyncMock()
    mock_controller.is_hand_raised = False
    return mock_controller


@pytest.fixture
def mock_add_to_queue(mocker: MockFixture) -> AsyncMock:
    return mocker.patch("core.hand.add_to_queue", new_callable=AsyncMock)


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
    assert not mock_servo_controller.is_hand_raised


@pytest.mark.anyio
async def test_raise_hand_raise(mock_servo_controller: MagicMock) -> None:
    # servo controller should set hand to raised
    await raise_hand(Mode.RAISE)

    mock_servo_controller.set_angle.assert_called_once_with(HALFWAY_ANGLE)
    assert mock_servo_controller.is_hand_raised


@pytest.mark.anyio
async def test_raise_hand_lower(mock_servo_controller: MagicMock) -> None:
    # servo controller should set hand to raised then lower it
    await raise_hand(Mode.RAISE)
    mock_servo_controller.set_angle.assert_called_with(HALFWAY_ANGLE)
    assert mock_servo_controller.is_hand_raised

    await raise_hand(Mode.LOWER)
    mock_servo_controller.set_angle.assert_called_with(MIN_ANGLE)
    assert not mock_servo_controller.is_hand_raised

    assert mock_servo_controller.set_angle.call_count == 2


@pytest.mark.anyio
async def test_process_hand_request_raise(
    mock_add_to_queue: AsyncMock,
    mock_send_notification: AsyncMock,
) -> None:
    # user should be able to raise hand
    mock_add_to_queue.return_value = True

    request = RaiseHandRequest(mode="RAISE", identity="user")
    mode, error = await process_hand_request(request)

    assert mode == Mode.RAISE
    assert error is None

    mock_add_to_queue.assert_called_once_with("user")
    mock_send_notification.assert_called_once_with("user")


@pytest.mark.anyio
async def test_process_hand_request_invalid_mode():
    # if mode is invalid, it should have an error
    request = RaiseHandRequest(mode="INVALID_MODE", identity="user")
    mode, error = await process_hand_request(request)

    assert mode is None
    assert error is not None


@pytest.mark.anyio
async def test_process_hand_request_lower(
    mock_servo_controller, mock_remove_from_queue
):
    # user should be able to lower hand
    mock_servo_controller.is_hand_raised = True
    mock_remove_from_queue.return_value = 0

    request = RaiseHandRequest(mode="LOWER", identity="user")
    mode, error = await process_hand_request(request)

    assert mode == Mode.LOWER
    assert error is None

    mock_remove_from_queue.assert_called_once_with("user")


@pytest.mark.anyio
async def test_process_hand_request_lower_fail(mock_servo_controller):
    # hand shouldn't lower if it isn't raised
    mock_servo_controller.is_hand_raised = False

    request = RaiseHandRequest(mode="LOWER", identity="user")
    mode, error = await process_hand_request(request)

    assert mode is None
    assert error is not None


@pytest.mark.anyio
async def test_process_hand_request_lower_return(
    mock_servo_controller, mock_remove_from_queue
):
    # mode should change from lower to lower_return if queue isn't empty
    mock_servo_controller.is_hand_raised = True
    mock_remove_from_queue.return_value = 1

    request = RaiseHandRequest(mode="LOWER", identity="user")
    mode, error = await process_hand_request(request)

    assert mode == Mode.LOWER_RETURN
    assert error is None
