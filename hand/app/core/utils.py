import logging
import signal
import sys

from core.servo_controller import servo_controller


def setup_handlers():
    # setup cleanup handlers
    def signal_handler(*_):
        servo_controller.stop()
        logging.info("Cleaning up and exiting...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
