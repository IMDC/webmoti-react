import sys


def is_pytest_running():
    return "pytest" in sys.modules
