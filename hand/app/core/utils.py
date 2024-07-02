import logging
import pathlib
import signal
import sys
from logging.handlers import RotatingFileHandler

from constants import LOG_PATH
from core.servo_controller import servo_controller


def setup_logging():
    path = pathlib.Path(LOG_PATH)
    if not path.parent.is_dir():
        path = pathlib.Path(__file__).parents[1] / "hand_server.log"

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
