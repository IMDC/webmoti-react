import logging
import socket
import threading
from time import sleep
from urllib.parse import parse_qs

from RPi import GPIO

# TODO need cleanup function on exit for toggle


logging.basicConfig(
    level=logging.INFO,
    filename="hand_server.log",
    filemode="a",
    format="%(asctime)s - %(levelname)s - %(message)s",
)


# 9th floor ip: 141.117.145.158
# 8th floor ip: 141.117.144.159
ETHERNET_IP = "141.117.144.159"
PORT = 80
MODES = ["WAVE2", "WAVE", "TOGGLE", "RAISE", "LOWER", "INIT"]
MAX_ANGLE = 160
MIN_ANGLE = 0
HALFWAY_ANGLE = 140

is_hand_raised = False
current_timer = None

# HTTP server with socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((ETHERNET_IP, PORT))
s.listen(1)

logging.info("Listening on %s:%s", ETHERNET_IP, PORT)

GPIO.setmode(GPIO.BOARD)
servo_pin = 12
GPIO.setup(servo_pin, GPIO.OUT)
pwm = GPIO.PWM(servo_pin, 50)


def set_servo_angle(angle):
    # Convert angle to duty cycle (2 to 12)
    duty_cycle = (angle / 18) + 2
    pwm.start(duty_cycle)
    sleep(1.5)
    # this prevents hand from moving after setting angle
    # pwm.stop()


# this is for if the hand was left up
def start_reset_timer():
    def reset_hand():
        global is_hand_raised
        if is_hand_raised:
            set_servo_angle(0)
            is_hand_raised = False

    # make sure there's only one timer
    global current_timer
    if current_timer:
        current_timer.cancel()

    # wait for 5 minutes
    timer = threading.Timer(300, reset_hand)
    timer.start()


def raise_hand(mode):
    def wave():
        set_servo_angle(MAX_ANGLE)
        set_servo_angle(MIN_ANGLE)

    global is_hand_raised
    logging.info(f"Raising hand with mode: {mode}")

    if mode == "WAVE2":
        wave()
        wave()

    elif mode == "WAVE":
        wave()

    elif mode == "TOGGLE":
        if is_hand_raised:
            set_servo_angle(MIN_ANGLE)
        else:
            # go farther than halfway so camera isn't blocked
            set_servo_angle(HALFWAY_ANGLE)
            start_reset_timer()
        is_hand_raised = not is_hand_raised

    elif mode == "RAISE":
        set_servo_angle(HALFWAY_ANGLE)
        is_hand_raised = True

    elif mode == "LOWER":
        set_servo_angle(MIN_ANGLE)
        is_hand_raised = False

    elif mode == "INIT":
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


if __name__ == "__main__":
    # Listen for connections
    while True:
        conn = None
        try:
            conn, addr = s.accept()
            logging.info(f"Got a connection from {addr}")

            # Receive the request
            request = conn.recv(1024).decode()
            headers, body = request.split("\r\n\r\n", 1)

            # Check if it's a POST request to raise hand
            if "POST /raisehand" in request:
                params = parse_qs(body)
                # default is wave if no params sent
                mode = params.get("mode", ["WAVE2"])[0].upper()
                if mode not in MODES:
                    logging.error(f"Invalid mode received: {mode}")
                    send_response(conn, "Invalid mode", "400 Bad Request")
                    continue
                raise_hand(mode)

            # Load and serve the HTML page
            body = get_html()
            send_response(conn, body, content_type="text/html")

        except Exception as e:
            logging.exception("An unexpected error occurred.")
            try:
                send_response(
                    conn, "Internal Server Error", "500 Internal Server Error"
                )
            except Exception:
                logging.error("Failed to send error response to client.")
        finally:
            conn.close()
