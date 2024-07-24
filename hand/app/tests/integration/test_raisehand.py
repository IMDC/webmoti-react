from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_raisehand() -> None:
    data = {"identity": "user", "mode": "RAISE"}
    response = client.post("/api/raisehand", json=data)
    assert response.status_code == 200


def test_raisehand_no_data() -> None:
    response = client.post("/api/raisehand")
    assert response.status_code != 200
