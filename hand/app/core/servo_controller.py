import asyncio
import os
import platform

import lgpio

from core.constants import SERVO_PIN

# this is for running on non rasp pi devices
is_rasp_pi = False
is_testing = os.getenv("PYTEST_RUNNING")
if (platform.system() == "Linux" and platform.machine() == "aarch64") or is_testing:
    is_rasp_pi = True


class ServoController:
    def __init__(self) -> None:
        if is_rasp_pi:
            self.chip = lgpio.gpiochip_open(0)
            lgpio.gpio_claim_output(self.chip, SERVO_PIN)

        # the lock is so multiple users can't use the servo at the same time
        self.lock = asyncio.Lock()
        self.is_hand_raised = False

    async def _set_angle(self, angle: float, sleep_time: float) -> None:
        if is_rasp_pi:
            pulse_width = int((angle / 180) * 2000 + 500)
            lgpio.tx_pwm(self.chip, SERVO_PIN, 50, pulse_width / 20000)
            await asyncio.sleep(sleep_time)
            lgpio.tx_pwm(self.chip, SERVO_PIN, 50, 0)

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
            lgpio.tx_pwm(self.chip, SERVO_PIN, 50, 0)
            lgpio.gpiochip_close(self.chip)


servo_controller = ServoController()
