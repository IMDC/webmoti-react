import pytest

# putting conftest.py in project root also allows pytest to find imports


@pytest.fixture
def anyio_backend():
    return "asyncio"
