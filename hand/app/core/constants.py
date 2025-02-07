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
MIN_ANGLE = 175

HALFWAY_ANGLE = 90

# a bit higher/lower than halfway for when queue is not empty
QUEUE_ANGLE_INCREMENT = 20
HALFWAY_HIGHER_ANGLE = HALFWAY_ANGLE - QUEUE_ANGLE_INCREMENT
HALFWAY_LOWER_ANGLE = HALFWAY_ANGLE + QUEUE_ANGLE_INCREMENT

# sleep times in ms for raising hand
# full is the time it takes to travel 180 degrees from side to side
FULL_SLEEP_TIME = 2
HALFWAY_SLEEP_TIME = 2
SMALL_SLEEP_TIME = 0.25


SERVO_PIN = 12

LOG_PATH = "/home/imdc1/hand_server.log"
