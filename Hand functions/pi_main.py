import socket
import threading
from time import sleep
from urllib.parse import parse_qs

from RPi import GPIO


# Function to load the modified HTML page
def get_html():
    with open("index.html", "r") as file:
        html = file.read()
    return html


# HTTP server with socket
# 9th floor ip: 141.117.145.158
# 8th floor ip: 141.117.144.159
ethernet_ip = "141.117.144.159"
port = 80

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((ethernet_ip, port))
s.listen(1)

print("Listening on", (ethernet_ip, port))

GPIO.setmode(GPIO.BOARD)
servo_pin = 12
GPIO.setup(servo_pin, GPIO.OUT)
pwm = GPIO.PWM(servo_pin, 50)

is_hand_raised = False


def set_servo_angle(angle):
    # Convert angle to duty cycle (2 to 12)
    duty_cycle = (angle / 18) + 2
    pwm.start(duty_cycle)
    sleep(1.5)
    # this prevents hand from moving after setting angle
    # pwm.stop()


current_timer = None


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
    global is_hand_raised

    if mode == "wave2":
        set_servo_angle(160)
        set_servo_angle(0)
        set_servo_angle(160)
        set_servo_angle(0)

    elif mode == "wave":
        set_servo_angle(160)
        set_servo_angle(0)

    elif mode == "toggle":
        if is_hand_raised:
            set_servo_angle(0)
        else:
            # go farther than halfway so camera isn't blocked
            set_servo_angle(140)
            start_reset_timer()
        is_hand_raised = not is_hand_raised

    elif mode == "init":
        # this is to initialize the remote.it connection to speed up future requests
        pass


# TODO need cleanup function on exit for toggle


def send_response(conn, body, status_code="200 OK", content_type="text/plain"):
    response_headers = f"HTTP/1.0 {status_code}\r\nContent-type: {content_type}\r\n\r\n"
    if isinstance(body, str):
        body = body.encode("utf-8")

    try:
        conn.sendall(response_headers.encode("utf-8") + body)
    except BrokenPipeError:
        print("Client disconnected before response could be sent.")
    finally:
        conn.close()


# Listen for connections
while True:
    try:
        conn, addr = s.accept()
        print("Got a connection from %s" % str(addr))

        # Receive the request
        request = conn.recv(1024).decode()
        headers, body = request.split("\r\n\r\n", 1)

        # Check if it's a POST request to raise hand
        if "POST /raisehand" in request:
            params = parse_qs(body)
            # default is wave if no params sent
            mode = params.get("mode", ["wave2"])[0]
            if mode not in ["wave2", "wave", "toggle", "init"]:
                send_response(conn, "Invalid mode", "400 Bad Request")
                continue
            raise_hand(mode)

        # Load and serve the HTML page
        body = get_html()
        send_response(conn, body, content_type="text/html")

    except Exception as e:
        print(f"An error occurred: {e}")
        try:
            send_response(conn, "Internal Server Error", "500 Internal Server Error")
        except Exception:
            print("Failed to send error response to client.")
    finally:
        conn.close()
