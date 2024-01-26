import socket
from time import sleep

from RPi import GPIO


# Function to load the modified HTML page
def get_html():
    with open("index.html", "r") as file:
        html = file.read()
    return html


# HTTP server with socket
ethernet_ip = "141.117.145.158"
port = 80

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((ethernet_ip, port))
s.listen(1)

print("Listening on", (ethernet_ip, port))

GPIO.setmode(GPIO.BOARD)
servo_pin = 12
GPIO.setup(servo_pin, GPIO.OUT)
pwm = GPIO.PWM(servo_pin, 50)


def set_servo_angle(angle):
    # Convert angle to duty cycle (2 to 12)
    duty_cycle = (angle / 18) + 2
    pwm.start(duty_cycle)
    sleep(1)


# Listen for connections
while True:
    conn, addr = s.accept()
    print("Got a connection from %s" % str(addr))

    # Receive the request
    request = conn.recv(1024).decode()

    # Check if it's a POST request to raise hand
    if "POST /raisehand" in request:
        # Run the "raiseHand" servo code
        try:
            set_servo_angle(160)
            sleep(0.5)
            set_servo_angle(0)
            sleep(0.5)
            set_servo_angle(160)
            sleep(0.5)
            set_servo_angle(0)
            sleep(1)
        except BrokenPipeError:
            print("Client disconnected before response completed.")

    # Load and serve the HTML page
    response = get_html()
    try:
        conn.send(b"HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n")
        conn.send(response.encode("utf-8"))
    except BrokenPipeError:
        print("Client disconnected before response completed.")

    conn.close()
