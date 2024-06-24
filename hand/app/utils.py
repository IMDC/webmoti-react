import logging
import pathlib
import signal
import sys
from logging.handlers import RotatingFileHandler
from time import sleep

from RPi import GPIO

from constants import LOG_PATH, SERVO_PIN


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


class ServoController:
    def __init__(self):
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(SERVO_PIN, GPIO.OUT)
        self.pwm = GPIO.PWM(SERVO_PIN, 50)
        self.pwm.start(0)

    def set_angle(self, angle):
        # Convert angle to duty cycle (2 to 12)
        duty_cycle = (angle / 18) + 2
        self.pwm.ChangeDutyCycle(duty_cycle)
        sleep(1.5)

    def stop(self):
        self.pwm.stop()
        GPIO.cleanup()


servo_controller = ServoController()
