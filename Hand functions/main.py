import enum
import logging
import signal
import socket
import sys
from logging.handlers import RotatingFileHandler
from time import sleep
from urllib.parse import parse_qs

from RPi import GPIO


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
HALFWAY_ANGLE = 140

is_hand_raised = False
current_timer = None

GPIO.setmode(GPIO.BOARD)
SERVO_PIN = 12
GPIO.setup(SERVO_PIN, GPIO.OUT)
pwm = GPIO.PWM(SERVO_PIN, 50)
pwm.start(0)


def set_servo_angle(angle):
    # Convert angle to duty cycle (2 to 12)
    duty_cycle = (angle / 18) + 2
    pwm.ChangeDutyCycle(duty_cycle)
    sleep(1.5)


# this is for if the hand was left up
# def start_reset_timer():
#     def reset_hand():
#         global is_hand_raised
#         if is_hand_raised:
#             set_servo_angle(0)
#             is_hand_raised = False

#     # make sure there's only one timer
#     global current_timer
#     if current_timer:
#         current_timer.cancel()

#     # wait for 5 minutes
#     timer = threading.Timer(300, reset_hand)
#     timer.start()


def raise_hand(mode):
    def wave():
        set_servo_angle(MAX_ANGLE)
        set_servo_angle(MIN_ANGLE)

    global is_hand_raised
    logging.info(f"Raising hand with mode: {mode}")

    if mode == Mode.WAVE2:
        wave()
        wave()

    elif mode == Mode.WAVE:
        wave()

    elif mode == Mode.TOGGLE:
        if is_hand_raised:
            set_servo_angle(MIN_ANGLE)
        else:
            # go farther than halfway so camera isn't blocked
            set_servo_angle(HALFWAY_ANGLE)
            # start_reset_timer()
        is_hand_raised = not is_hand_raised

    elif mode == Mode.RAISE:
        set_servo_angle(HALFWAY_ANGLE)
        is_hand_raised = True

    elif mode == Mode.LOWER:
        set_servo_angle(MIN_ANGLE)
        is_hand_raised = False

    elif mode == Mode.RERAISE:
        set_servo_angle(MIN_ANGLE)
        set_servo_angle(HALFWAY_ANGLE)

    elif mode == Mode.INIT:
        # this is to initialize the remote.it connection to speed up future requests
        logging.info("Initializing remote.it connection")


# Function to load the modified HTML page
def get_html():
    with open("index.html", "r") as file:
        html = file.read()
    return html


def send_response(conn, body, status_code="200 OK", content_type="text/plain"):
    try:
        response_headers = (
            f"HTTP/1.0 {status_code}\r\nContent-type: {content_type}\r\n\r\n"
        )
        if isinstance(body, str):
            body = body.encode("utf-8")

        conn.sendall(response_headers.encode("utf-8") + body)
        logging.info(f"Sent response with status {status_code}.")
    except BrokenPipeError:
        logging.warning("Client disconnected before response could be sent.")


def handle_request(conn):
    request = conn.recv(1024).decode()
    split = request.split("\r\n\r\n", 1)

    if "POST /raisehand" in request:
        mode = None
        if len(split) == 2:
            _, body = split
            params = parse_qs(body)
            # default is wave if no params sent
            mode = params.get("mode", [Mode.WAVE2.name])[0].upper()
        else:
            # no body in request
            mode = Mode.WAVE2.name

        try:
            mode_enum = Mode[mode]
        except KeyError:
            logging.error(f"Invalid mode received: {mode}")
            send_response(conn, "Invalid mode", "400 Bad Request")
            return

        raise_hand(mode_enum)

    # Load and serve the HTML page
    body = get_html()
    send_response(conn, body, content_type="text/html")


def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", PORT))
        s.listen(1)
        logging.info("Server started. Listening on %s:%s", s.getsockname()[0], PORT)

        while True:
            conn, addr = s.accept()
            with conn:
                logging.info(f"Got a connection from {addr}")
                try:
                    handle_request(conn)
                except Exception:
                    logging.exception("An unexpected error occurred.")
                    try:
                        send_response(
                            conn, "Internal Server Error", "500 Internal Server Error"
                        )
                    except Exception as e:
                        logging.error(f"Failed to send error response to client: {e}")


if __name__ == "__main__":
    # setup logging
    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(level=logging.INFO, format=log_format, handlers=[])
    # rotate when log file is 5mb
    handler = RotatingFileHandler(
        "/home/imdc1/hand_server.log", maxBytes=5 * 1024 * 1024, backupCount=5
    )
    formatter = logging.Formatter(log_format)
    handler.setFormatter(formatter)
    logging.getLogger().addHandler(handler)

    def signal_handler(*_):
        pwm.stop()
        GPIO.cleanup()
        logging.info("Cleaning up and exiting...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    main()
