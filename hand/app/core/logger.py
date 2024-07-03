import pathlib
from logging import config
from typing import Any

from constants import LOG_PATH

path = pathlib.Path(LOG_PATH)
if not path.parent.is_dir():
    path = pathlib.Path(__file__).parents[1] / "hand_server.log"

LOGGING_CONFIG: dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(asctime)s - %(levelprefix)s %(message)s",
            "use_colors": None,
        },
        "access": {
            "()": "uvicorn.logging.AccessFormatter",
            "fmt": '%(asctime)s - %(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s',
        },
        "file": {
            "format": "%(asctime)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "file_handler": {
            "formatter": "file",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(path),
            "mode": "a+",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
        },
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.error": {
            "handlers": ["default", "file_handler"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn.access": {
            "handlers": ["access", "file_handler"],
            "level": "INFO",
            "propagate": False,
        },
        "root": {
            "handlers": ["default", "file_handler"],
            "level": "INFO",
        },
    },
}

config.dictConfig(LOGGING_CONFIG)
