"""
Use this script for testing the hand from the raspberry pi terminal
"""

import argparse
import time

from RPi import GPIO


def setup():
    SERVO_PIN = 12
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(SERVO_PIN, GPIO.OUT)
    pwm = GPIO.PWM(SERVO_PIN, 50)
    pwm.start(0)
    return pwm


def test_hand(pwm, angle):
    duty_cycle = (angle / 18) + 2
    pwm.ChangeDutyCycle(duty_cycle)
    time.sleep(2)
    pwm.ChangeDutyCycle(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("angle", type=float, help="Specify an angle in degrees")
    args = parser.parse_args()

    pwm = setup()
    test_hand(pwm, args.angle)
