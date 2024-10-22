import enum


class Mode(enum.Enum):
    WAVE2 = "WAVE2"
    WAVE = "WAVE"
    RAISE = "RAISE"
    LOWER = "LOWER"
    RAISE_RETURN = "RAISE_RETURN"
    LOWER_RETURN = "LOWER_RETURN"
    INIT = "INIT"


PORT = 8080

MAX_ANGLE = 30
MIN_ANGLE = 180
# go farther than halfway so camera isn't blocked
HALFWAY_ANGLE = 90

# a bit higher/lower than halfway for when queue is not empty
HALFWAY_HIGHER_ANGLE = 70
HALFWAY_LOWER_ANGLE = 110

# sleep times in ms for raising hand
# full is the time it takes to travel 180 degrees from side to side
FULL_SLEEP_TIME = 1.5
HALFWAY_SLEEP_TIME = FULL_SLEEP_TIME / 2
SMALL_SLEEP_TIME = 0.25


SERVO_PIN = 12

LOG_PATH = "/home/imdc1/hand_server.log"
