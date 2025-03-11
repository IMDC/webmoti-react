from core.servo_controller import ServoController


def test_servo_controller_init() -> None:
    # the servo controller should have pwm and other attributes
    servo_controller = ServoController()

    assert servo_controller.pwm is not None

    assert servo_controller.lock is not None
