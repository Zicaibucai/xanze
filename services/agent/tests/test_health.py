from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_and_request_id() -> None:
    response = client.get("/health", headers={"X-Request-ID": "agent-health-test"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "agent-health-test"
    assert response.json()["status"] == "UP"
    assert response.json()["service"] == "xanze-agent"

