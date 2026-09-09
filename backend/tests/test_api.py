import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SmartMastitis AI"
    assert data["status"] == "operational"

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["herd_strength"]["total_animals"] == 80
    assert data["herd_strength"]["cattle"] == 65
    assert data["herd_strength"]["buffaloes"] == 15
    assert data["mastitis_risk"]["no_risk"] == 45
    assert data["mastitis_risk"]["high_risk"] == 5

def test_dashboard_charts():
    response = client.get("/api/dashboard/charts")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data
    assert "risk_trend" in data
    assert "milk_yield_trend" in data
    assert "scc_trend" in data
    assert "conductivity_trend" in data
    assert "activity_trend" in data
    assert "rumination_trend" in data
    assert "environmental_trend" in data
    assert "new_high_risk_trend" in data
    assert "confirmed_cases_trend" in data

def test_cow004_prediction():
    response = client.get("/api/prediction/COW004")
    assert response.status_code == 200
    data = response.json()
    assert data["animal_id"] == "COW004"
    assert data["risk_level"] == "HIGH RISK"
    assert data["risk_percentage"] == 74
    assert len(data["contributing_factors"]) > 0
    assert "ELEVATED MASTITIS RISK DETECTED" in data["alert_banner"]

def test_cow001_healthy_no_risk():
    response = client.get("/api/prediction/COW001")
    assert response.status_code == 200
    data = response.json()
    assert data["animal_id"] == "COW001"
    assert data["risk_level"] == "NO RISK"
    assert data["risk_percentage"] == 8

def test_risk_progression_demo():
    response = client.get("/api/prediction/demo/progression")
    assert response.status_code == 200
    data = response.json()
    assert "high_risk_animal" in data
    assert "healthy_animal" in data
    assert data["high_risk_animal"]["progression"][0]["risk_pct"] == 18
    assert data["high_risk_animal"]["progression"][-1]["risk_pct"] == 76

def test_iot_devices_and_ingestion():
    # Test listing devices
    dev_resp = client.get("/api/iot/devices")
    assert dev_resp.status_code == 200
    devices = dev_resp.json()
    assert len(devices) >= 5

    # Test collar ingestion
    col_payload = {
        "farm_id": "FARM001",
        "animal_id": "COW004",
        "device_id": "COLLAR001",
        "surface_temperature": 38.4,
        "activity": 42.0,
        "movement_frequency": 18.0,
        "resting_duration": 3.4,
        "rumination_estimate": 420.0,
        "battery": 82
    }
    col_resp = client.post("/api/iot/collar", json=col_payload)
    assert col_resp.status_code == 201

def test_dataset_export():
    json_resp = client.get("/api/dataset/export/json")
    assert json_resp.status_code == 200
    assert json_resp.json()["total_records"] == 80

    csv_resp = client.get("/api/dataset/export/csv")
    assert csv_resp.status_code == 200
    assert "animal_id,date,species,breed" in csv_resp.text

def test_milking_and_hygiene_records():
    sessions_resp = client.get("/api/records/milking/sessions")
    assert sessions_resp.status_code == 200
    assert len(sessions_resp.json()) > 0

    audits_resp = client.get("/api/records/milking/hygiene-audits")
    assert audits_resp.status_code == 200
    assert len(audits_resp.json()) > 0

    worker_resp = client.get("/api/records/milking/worker-hygiene")
    assert worker_resp.status_code == 200
    assert len(worker_resp.json()) > 0

def test_gis_farm_map():
    map_resp = client.get("/api/gis/farm-map")
    assert map_resp.status_code == 200
    data = map_resp.json()
    assert "sheds" in data
    assert "animal_markers" in data
    assert len(data["animal_markers"]) >= 5
    assert "hotspot_analysis" in data
    assert data["hotspot_analysis"]["shed"] == "Shed 2"

def test_ml_performance_and_continuous_learning():
    perf_resp = client.get("/api/ml/performance")
    assert perf_resp.status_code == 200
    perf = perf_resp.json()
    assert "primary_model" in perf
    assert perf["primary_model"]["roc_auc"] >= 0.90

    learn_resp = client.get("/api/ml/continuous-learning")
    assert learn_resp.status_code == 200
    learn = learn_resp.json()
    assert "pipeline_stages" in learn
    assert len(learn["pipeline_stages"]) == 7
    assert "governance_rule" in learn

def test_animal_and_herd_reports():
    cow_rep = client.get("/api/reports/animal/COW004")
    assert cow_rep.status_code == 200
    assert cow_rep.json()["animal"]["animal_id"] == "COW004"

    herd_rep = client.get("/api/reports/herd")
    assert herd_rep.status_code == 200
    assert herd_rep.json()["herd_summary"]["total_animals"] == 80

def test_capa_endpoints():
    # 1. List CAPAs
    list_resp = client.get("/api/capa")
    assert list_resp.status_code == 200
    actions = list_resp.json()
    assert len(actions) >= 6

    # 2. CAPA Stats
    stats_resp = client.get("/api/capa/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_actions"] >= 6
    assert "resolution_rate" in stats

    # 3. Create a new CAPA
    new_capa = {
        "title": "Automated Unit Test CAPA Incident",
        "animal_id": "COW002",
        "category": "Milking Hygiene",
        "trigger_source": "AI Early Warning Alert",
        "severity": "HIGH",
        "root_cause": "Conductivity deviation +12% during evening shift",
        "corrective_action": "Segregate animal for physical examination",
        "preventive_action": "Review pre-dip sanitizer contact timing",
        "assigned_to": "Dr. Rajesh Sharma",
        "target_date": "2026-09-15"
    }
    create_resp = client.post("/api/capa", json=new_capa)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert "CAPA-" in created_data["action_id"]
    action_id = created_data["action_id"]

    # 4. Update status with verification notes
    update_payload = {
        "status": "RESOLVED",
        "verification_notes": "CMT test confirmed negative. Cluster returned to normal service.",
        "verified_by": "Dr. Rajesh Sharma"
    }
    update_resp = client.put(f"/api/capa/{action_id}/status", json=update_payload)
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["status"] == "RESOLVED"
    assert updated_data["resolved_at"] is not None
    assert updated_data["verified_by"] == "Dr. Rajesh Sharma"

