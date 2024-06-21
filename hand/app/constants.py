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

MAX_ANGLE = 160
MIN_ANGLE = 0
# go farther than halfway so camera isn't blocked
HALFWAY_ANGLE = 140

SERVO_PIN = 12

LOG_PATH = "/home/imdc1/hand_server.log"
