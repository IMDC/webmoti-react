import logging
import pathlib
import platform
import signal
import sys
from logging.handlers import RotatingFileHandler
from time import sleep

from constants import HALFWAY_ANGLE, LOG_PATH, MAX_ANGLE, MIN_ANGLE, SERVO_PIN, Mode

# this is for testing
is_rasp_pi = False
if platform.system() == "Linux" and platform.machine() == "aarch64":
    from RPi import GPIO

    is_rasp_pi = True


def setup_logging():
    path = pathlib.Path(LOG_PATH)
    if not path.parent.is_dir():
        path = pathlib.Path(__file__).parent / "hand_server.log"

    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(level=logging.INFO, format=log_format, handlers=[])
    # rotate when log file is 5mb
    handler = RotatingFileHandler(path, maxBytes=5 * 1024 * 1024, backupCount=5)
    formatter = logging.Formatter(log_format)
    handler.setFormatter(formatter)
    logging.getLogger().addHandler(handler)


def setup_handlers():
    # setup cleanup handlers
    def signal_handler(*_):
        servo_controller.stop()
        logging.info("Cleaning up and exiting...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


async def raise_hand(mode: Mode):
    def wave():
        servo_controller.set_angle(MAX_ANGLE)
        servo_controller.set_angle(MIN_ANGLE)

    logging.info(f"Raising hand with mode: {mode}")

    if mode == Mode.WAVE2:
        wave()
        wave()

    elif mode == Mode.WAVE:
        wave()

    elif mode == Mode.TOGGLE:
        is_hand_raised = servo_controller.is_hand_raised
        if is_hand_raised:
            servo_controller.set_angle(MIN_ANGLE)
        else:
            # go farther than halfway so camera isn't blocked
            servo_controller.set_angle(HALFWAY_ANGLE)
        servo_controller.is_hand_raised = not is_hand_raised

    elif mode == Mode.RAISE:
        servo_controller.set_angle(HALFWAY_ANGLE)
        servo_controller.is_hand_raised = True

    elif mode == Mode.LOWER:
        servo_controller.set_angle(MIN_ANGLE)
        servo_controller.is_hand_raised = False

    elif mode == Mode.RERAISE:
        servo_controller.set_angle(MIN_ANGLE)
        servo_controller.set_angle(HALFWAY_ANGLE)

    elif mode == Mode.INIT:
        # this is to initialize the remote.it connection to speed up future requests
        logging.info("Initializing remote.it connection")


class ServoController:
    def __init__(self):
        if is_rasp_pi:
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(SERVO_PIN, GPIO.OUT)
            self.pwm = GPIO.PWM(SERVO_PIN, 50)
            self.pwm.start(0)

        self.is_hand_raised = False

    def set_angle(self, angle):
        if is_rasp_pi:
            # Convert angle to duty cycle (2 to 12)
            duty_cycle = (angle / 18) + 2
            self.pwm.ChangeDutyCycle(duty_cycle)
            sleep(1.5)

    def stop(self):
        if is_rasp_pi:
            self.pwm.stop()
            GPIO.cleanup()


servo_controller = ServoController()
