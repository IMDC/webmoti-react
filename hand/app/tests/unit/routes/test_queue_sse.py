import pytest
from pytest_mock import MockFixture

from routes.queue_sse import add_to_queue


@pytest.mark.anyio
async def test_add_to_queue_new_identity(mocker: MockFixture):
    mock_queue = mocker.patch("routes.queue_sse.queue", [])

    identity = "user"
    result = await add_to_queue(identity)

    assert result is True
    assert mock_queue == [identity]


@pytest.mark.anyio
async def test_add_to_queue_same_identity(mocker: MockFixture):
    identity = "user"
    mock_queue = mocker.patch("routes.queue_sse.queue", [identity])

    result = await add_to_queue(identity)

    assert result is False
    assert mock_queue == [identity]
