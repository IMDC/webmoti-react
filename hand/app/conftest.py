import os
import sys

import pytest

# putting conftest.py in project root also allows pytest to find imports


os.environ["PYTEST_RUNNING"] = "true"


@pytest.fixture
def anyio_backend():
    return "asyncio"


# mock RPi.GPIO module
gpio = type(sys)("GPIO")


class MockPWM:
    def __init__(self, *_):
        pass

    def start(self, _):
        pass

    def ChangeDutyCycle(self, _):
        pass


gpio.setmode = lambda _: None
gpio.BOARD = 10
gpio.setup = lambda *_: None
gpio.OUT = 0
gpio.PWM = MockPWM

sys.modules["RPi"] = type(sys)("RPi")
sys.modules["RPi.GPIO"] = gpio
