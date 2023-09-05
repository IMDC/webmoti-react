import network
import machine
import socket
from time import sleep
from machine import Pin, PWM

# ... (Connect to Wi-Fi function and servo setup, omitted for brevity)

def connect_to_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(ssid, password)
        while not wlan.isconnected():
            pass
    print('Connection successful')
    print(wlan.ifconfig())

# Connect to Wi-Fi network
ssid = ''
password = ''
connect_to_wifi(ssid, password)

# Function to load the modified HTML page
def get_html():
    with open('index.html', 'r') as file:
        html = file.read()
        
    return html

# HTTP server with socket
addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

s = socket.socket()
s.bind(addr)
s.listen(1)

print('Listening on', addr)

# Variables to store the hand status
hand_status = "stopHand"  # Initialize to stopHand
servo1 = PWM(Pin(0))
servo1.freq(50)
min_pulse_width = 1500
max_pulse_width = 8000
min_angle = 0
max_angle = 120

def set_servo_angle(angle):
    pulse_width = int((angle - min_angle) * (max_pulse_width - min_pulse_width) / (max_angle - min_angle) + min_pulse_width)
    print(pulse_width)
    servo1.duty_u16(pulse_width)

# Listen for connections
while True:
    conn = None  # Initialize conn variable to None
    try:     
        conn, addr = s.accept()
        print('Got a connection from %s' % str(addr))

        # Receive the request
        request = conn.recv(1024).decode()

        # Check if it's a POST request to raise hand
        if "POST /raisehand" in request:
            # Run the "raiseHand" servo code
            for _ in range(2):
                set_servo_angle(120)
                sleep(2)
                set_servo_angle(40)
                sleep(1)
                set_servo_angle(110)
                sleep(1)
                set_servo_angle(40)
                sleep(1)
                set_servo_angle(110)
                sleep(1)
                set_servo_angle(0)
                sleep(2)
                # ... Add the rest of the servo code for "raiseHand" status

        # Load and serve the HTML page
        response = get_html()
        conn.send(b'HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
        conn.send(response.encode('utf-8'))
        
    except OSError as e:
        if conn:
            conn.close()
        print('Connection closed')