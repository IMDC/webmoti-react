import logging
import signal
import sys
from logging.handlers import RotatingFileHandler
from time import sleep

from constants import LOG_PATH, SERVO_PIN

# from RPi import GPIO


def setup_gpio():
    # GPIO.setmode(GPIO.BOARD)
    # GPIO.setup(SERVO_PIN, GPIO.OUT)
    # pwm = GPIO.PWM(SERVO_PIN, 50)
    # pwm.start(0)

    pass


def setup_logging():
    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(level=logging.INFO, format=log_format, handlers=[])
    # rotate when log file is 5mb
    handler = RotatingFileHandler(LOG_PATH, maxBytes=5 * 1024 * 1024, backupCount=5)
    formatter = logging.Formatter(log_format)
    handler.setFormatter(formatter)
    logging.getLogger().addHandler(handler)


def setup_handlers():
    # setup cleanup handlers
    def signal_handler(*_):
        # pwm.stop()
        # GPIO.cleanup()
        logging.info("Cleaning up and exiting...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


class ServoController:
    def __init__(self):
        # GPIO.setmode(GPIO.BOARD)
        # GPIO.setup(SERVO_PIN, GPIO.OUT)
        # self.pwm = GPIO.PWM(SERVO_PIN, 50)
        # self.pwm.start(0)
        pass

    def set_angle(self, angle):
        # Convert angle to duty cycle (2 to 12)
        # duty_cycle = (angle / 18) + 2
        # self.pwm.ChangeDutyCycle(duty_cycle)
        # sleep(1.5)

        print(angle)


servo_controller = ServoController()
