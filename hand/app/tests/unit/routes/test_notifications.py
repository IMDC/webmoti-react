from unittest.mock import MagicMock, call

import pytest
from pytest_mock import MockFixture

from routes.notifications import send_notification


@pytest.fixture
def mock_push(mocker: MockFixture) -> MagicMock:
    return mocker.patch("routes.notifications.push")


@pytest.mark.anyio
async def test_send_notification(mocker: MockFixture, mock_push: MagicMock) -> None:
    # it should send a notification to each subscription

    mock_subs = [{1: "sub1"}, {2: "sub2"}]
    mocker.patch("routes.notifications.subscriptions", mock_subs)

    name = "user"

    await send_notification(name)

    expected_calls = [
        call(mock_subs[0], f"{name} has a question!"),
        call(mock_subs[1], f"{name} has a question!"),
    ]

    assert mock_push.call_args_list == expected_calls


@pytest.mark.anyio
async def test_send_notification_no_subs(
    mocker: MockFixture, mock_push: MagicMock
) -> None:
    # it shouldn't send any notifications when no subscriptions

    mocker.patch("routes.notifications.subscriptions", [])
    await send_notification("user")

    mock_push.assert_not_called()
