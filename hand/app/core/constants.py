import enum


class Mode(enum.Enum):
    WAVE2 = "WAVE2"
    WAVE = "WAVE"
    TOGGLE = "TOGGLE"
    RAISE = "RAISE"
    LOWER = "LOWER"
    RERAISE = "RERAISE"
    INIT = "INIT"


PORT = 80

MAX_ANGLE = 30
MIN_ANGLE = 180
# go farther than halfway so camera isn't blocked
HALFWAY_ANGLE = 90

SERVO_PIN = 12

LOG_PATH = "/home/imdc1/hand_server.log"
