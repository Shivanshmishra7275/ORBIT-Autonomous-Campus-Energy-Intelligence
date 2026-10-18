from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_buildings_and_single_building():
    listing = client.get("/buildings")
    assert listing.status_code == 200
    assert len(listing.json()) >= 4
    assert all(item["is_simulated"] is True for item in listing.json())

    building = client.get("/buildings/ENG-01")
    assert building.status_code == 200
    assert building.json()["name"] == "Engineering Block"
    assert building.json()["is_simulated"] is True


def test_unknown_building_returns_404():
    response = client.get("/buildings/UNKNOWN")
    assert response.status_code == 404


def test_analyze_happy_path_and_failure():
    ok = client.post("/analyze", json={"building_id": "ENG-01", "objective": "Reduce electricity costs while maintaining comfort"})
    assert ok.status_code == 200
    payload = ok.json()
    assert payload["is_simulated"] is True
    assert payload["source"] == "deterministic_engine"

    missing = client.post("/analyze", json={"building_id": "UNKNOWN", "objective": "Reduce cost"})
    assert missing.status_code == 404


def test_analyze_payload_validation():
    invalid = client.post("/analyze", json={"building_id": "ENG-01", "objective": "bad"})
    assert invalid.status_code == 422


def test_analyze_payload_rejects_invalid_building_id_type():
    invalid = client.post("/analyze", json={"building_id": None, "objective": "Reduce electricity costs while maintaining comfort"})
    assert invalid.status_code == 422
