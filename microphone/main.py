import network
import machine
import socket
from time import sleep
from machine import Pin, PWM

servo1 = PWM(Pin(1))
servo1.freq(50)
servo2 = PWM(Pin(2))
servo2.freq(50)
min_pulse_width = 1500  
max_pulse_width = 9000  
min_angle = 0
max_angle = 240
min_angley = 0
max_angley = 210
        
def set_servo_anglex(angle):
    pulse_width = int((angle - min_angle) * (max_pulse_width - min_pulse_width) / (max_angle - min_angle) + min_pulse_width)
    print(pulse_width)
    servo1.duty_u16(pulse_width)
def set_servo_angley(angle):
    pulse_width = int((angle - min_angley) * (max_pulse_width - min_pulse_width) / (max_angley - min_angley) + min_pulse_width)
    print(pulse_width)
    servo2.duty_u16(pulse_width)

    
ssid = 'Servo-Control'
password = '12345678'

ap = network.WLAN(network.AP_IF)
ap.config(essid=ssid, password=password)
ap.active(True)

while ap.active() == False:
  pass

print('Connection successful')
print(ap.ifconfig())

# Function to load in html page    
def get_html(html_name):
    with open(html_name, 'r') as file:
        html = file.read()
        
    return html

# HTTP server with socket
addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

s = socket.socket()
s.bind(addr)
s.listen(1)

print('Listening on', addr)

# Listen for connections
while True:
    try:
        conn, addr = s.accept()
        print('Got a connection from %s' % str(addr))
        request = conn.recv(1024)
        # print('Content = %s' % str(request))
        request = str(request)
        
        # Parse the X and Y values from the request
        index_x = request.find('x=') + len('x=')
        index_y = request.find('y=') + len('y=')
        if request[index_x].isdigit() and request[index_y].isdigit():
            offset = 1
            if request[index_x+1].isdigit():
                offset = 2
                if request[index_x+2].isdigit():
                    offset = 3
            x = int(request[index_x:index_x+offset])
            
            offset = 1
            if request[index_y+1].isdigit():
                offset = 2
                if request[index_y+2].isdigit():
                    offset = 3
            y = int(request[index_y:index_y+offset])
            
            print(f"Received X: {x}, Y: {y}")
            
            # Perform the servo rotation based on the X and Y values
            # Here you can write your own logic to rotate the servo based on the X and Y values
            # For example, you could use x and y to calculate the angle to rotate the servo to
            print(x)
            set_servo_anglex(x)
            sleep(1)
            print(y)
            set_servo_angley(y)
            sleep(1)
        
        # Load html and replace with current data 
        response = get_html('index.html')
        try:
            response = response.replace('slider_value', str(x))
        except Exception as e:
            response = response.replace('slider_value', '0')
        
        conn.send('HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
        conn.send(response)
        conn.close()
    except OSError as e:
        conn.close()
        print('Connection closed')