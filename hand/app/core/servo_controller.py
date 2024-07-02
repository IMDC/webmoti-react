import platform
from time import sleep

from constants import SERVO_PIN

# this is for testing
is_rasp_pi = False
if platform.system() == "Linux" and platform.machine() == "aarch64":
    from RPi import GPIO

    is_rasp_pi = True


class ServoController:
    def __init__(self):
        if is_rasp_pi:
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(SERVO_PIN, GPIO.OUT)
            self.pwm = GPIO.PWM(SERVO_PIN, 50)
            self.pwm.start(0)

        self.is_hand_raised = False

    def set_angle(self, angle):
        if is_rasp_pi:
            # Convert angle to duty cycle (2 to 12)
            duty_cycle = (angle / 18) + 2
            self.pwm.ChangeDutyCycle(duty_cycle)
            sleep(1.5)

    def stop(self):
        if is_rasp_pi:
            self.pwm.stop()
            GPIO.cleanup()


servo_controller = ServoController()
