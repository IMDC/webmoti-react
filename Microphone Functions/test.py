from time import sleep
from machine import Pin, PWM

servo1 = PWM(Pin(1))
servo1.freq(50)
min_pulse_width = 1000  
max_pulse_width = 9000  
min_angle = 0  
max_angle = 120

def set_servo_angle(angle):
    pulse_width = int((angle - min_angle) * (max_pulse_width - min_pulse_width) / (max_angle - min_angle) + min_pulse_width)
    print(pulse_width)
    servo1.duty_u16(pulse_width)

set_servo_angle(110)
sleep(1)
servo1.deinit()