import asyncio
import platform

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

        # the lock is so multiple users can't use the servo at the same time
        self.lock = asyncio.Lock()
        self.is_hand_raised = False

    async def _set_angle(self, angle):
        if is_rasp_pi:
            # convert angle to duty cycle (2 to 12)
            duty_cycle = (angle / 18) + 2
            self.pwm.ChangeDutyCycle(duty_cycle)
            await asyncio.sleep(1.5)

    async def set_angle(self, angle):
        async with self.lock:
            await self._set_angle(angle)

    async def set_angle_twice(self, angle1, angle2):
        async with self.lock:
            await self._set_angle(angle1)
            await asyncio.sleep(0.5)
            await self._set_angle(angle2)

    def stop(self):
        if is_rasp_pi:
            self.pwm.stop()
            GPIO.cleanup()


servo_controller = ServoController()
