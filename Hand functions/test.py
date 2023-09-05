from time import sleep
from machine import Pin, PWM

servo1 = PWM(Pin(0))
servo1.freq(50)
min_pulse_width = 1500 
max_pulse_width = 7280  
min_angle =0 
max_angle = 120

def set_servo_angle(angle):
    pulse_width = int((angle - min_angle) * (max_pulse_width - min_pulse_width) / (max_angle - min_angle) + min_pulse_width)
    print(pulse_width)
    servo1.duty_u16(pulse_width)
for _ in range(1):
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
    set_servo_angle(40)
    sleep(1)
    set_servo_angle(110)
    sleep(1)
    set_servo_angle(40)
    sleep(1)
    set_servo_angle(110)
    sleep(1)
    set_servo_angle(40)
    sleep(1)
    set_servo_angle(0)
    sleep(2)

servo1.deinit()