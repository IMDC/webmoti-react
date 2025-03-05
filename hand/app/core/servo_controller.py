import asyncio
import os
import platform

from gpiozero import AngularServo

from core.constants import SERVO_PIN

# this is for running on non rasp pi devices
is_rasp_pi = False
is_testing = os.getenv("PYTEST_RUNNING")
if (platform.system() == "Linux" and platform.machine() == "aarch64") or is_testing:
    is_rasp_pi = True


class ServoController:
    def __init__(self) -> None:
        if is_rasp_pi:
            self.servo = AngularServo(SERVO_PIN, min_angle=0, max_angle=180)

        # the lock is so multiple users can't use the servo at the same time
        self.lock = asyncio.Lock()
        self.is_hand_raised = False

    async def _set_angle(self, angle: float, sleep_time: float) -> None:
        if is_rasp_pi:
            self.servo.angle = angle
            await asyncio.sleep(sleep_time)
            self.servo.angle = None

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
            self.servo.angle = None
            self.servo.close()


servo_controller = ServoController()
