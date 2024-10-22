import asyncio
import os
import platform

from core.constants import SERVO_PIN

# this is for running on non rasp pi devices
is_rasp_pi = False
is_testing = os.getenv("PYTEST_RUNNING")
if (platform.system() == "Linux" and platform.machine() == "aarch64") or is_testing:
    from RPi import GPIO

    is_rasp_pi = True


class ServoController:
    def __init__(self) -> None:
        if is_rasp_pi:
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(SERVO_PIN, GPIO.OUT)
            self.pwm = GPIO.PWM(SERVO_PIN, 50)
            self.pwm.start(0)

        # the lock is so multiple users can't use the servo at the same time
        self.lock = asyncio.Lock()
        self.is_hand_raised = False

    async def _set_angle(self, angle: float, sleep_time: float) -> None:
        if is_rasp_pi:
            # convert angle to duty cycle (2 to 12)
            duty_cycle = (angle / 18) + 2
            self.pwm.ChangeDutyCycle(duty_cycle)
            # wait a bit before stopping servo to remove momentum
            await asyncio.sleep(sleep_time)
            # relax servo to stop erratic movements
            self.pwm.ChangeDutyCycle(0)

    async def set_angle(self, angle: float, sleep_time) -> None:
        async with self.lock:
            await self._set_angle(angle, sleep_time)

    async def set_angle_twice(
        self, angle1: float, angle2: float, sleep_time: float
    ) -> None:
        async with self.lock:
            await self._set_angle(angle1, sleep_time)
            await self._set_angle(angle2, sleep_time)

    def stop(self) -> None:
        if is_rasp_pi:
            self.pwm.stop()
            GPIO.cleanup()


servo_controller = ServoController()
