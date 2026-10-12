import os
import sys
import pytest
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.schemas import TransactionRecord, AnalysisRequest
from app.features import extract_features
from app.rules import evaluate_rules
from app.anomaly_service import detect_anomaly
from app.model_service import MLModelManager
from app.risk import assess_risk

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "modules" in data
    assert "feature_extractor" in data["modules"]

def test_empty_transactions_feature_extraction():
    features = extract_features(
        target="0x0000000000000000000000000000000000000000",
        target_type="address",
        transactions=[]
    )
    assert features.tx_count == 0
    assert features.in_eth == 0.0
    assert features.out_eth == 0.0

def test_insufficient_data_risk_assessment():
    features = extract_features(
        target="0x1111111111111111111111111111111111111111",
        target_type="address",
        transactions=[]
    )
    anomaly = detect_anomaly(features)
    model_mgr = MLModelManager(model_path="non_existent_model.joblib")
    ml = model_mgr.predict(features)
    
    risk = assess_risk(
        features=features,
        rules=[],
        anomaly=anomaly,
        ml=ml,
        data_completeness="INSUFFICIENT"
    )
    assert risk.risk_classification == "Insufficient Data"
    assert risk.risk_score is None

def test_rapid_peeling_rule_trigger():
    now = int(time.time())
    target = "0x2222222222222222222222222222222222222222"
    
    # 3 pairs of in-and-immediate-out transactions within 5 minutes
    txs = [
        TransactionRecord(hash="0x01", from_address="0xaaa", to_address=target, value_eth=10.0, timestamp=now),
        TransactionRecord(hash="0x02", from_address=target, to_address="0xbbb", value_eth=9.9, timestamp=now + 120),
        TransactionRecord(hash="0x03", from_address="0xccc", to_address=target, value_eth=15.0, timestamp=now + 600),
        TransactionRecord(hash="0x04", from_address=target, to_address="0xddd", value_eth=14.8, timestamp=now + 750),
    ]

    features = extract_features(target=target, target_type="address", transactions=txs)
    assert features.tx_count == 4
    assert features.rapid_onward_ratio >= 0.5

    rules = evaluate_rules(target=target, features=features, transactions=txs)
    peeling_rule = next(r for r in rules if r.rule_id == "RULE_RAPID_PEELING_FLOW")
    assert peeling_rule.triggered is True
    assert "0x01" in peeling_rule.supporting_txs

def test_missing_model_graceful_handling():
    # Intentionally point to a missing file to test unconfigured model handling
    mgr = MLModelManager(model_path="missing_path_for_testing.joblib")
    features = extract_features("0x123", "address", [])
    ml_res = mgr.predict(features)
    
    assert ml_res.is_available is False
    assert "not configured" in ml_res.status_message

def test_analyze_endpoint_full_pipeline():
    now = int(time.time())
    payload = {
        "target_identifier": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "target_type": "address",
        "analysis_scope": "standard",
        "network": "ethereum",
        "transactions": [
            {
                "hash": "0xabc1",
                "from_address": "0x1111111111111111111111111111111111111111",
                "to_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                "value_eth": 2.5,
                "timestamp": now - 3600,
                "is_error": False
            },
            {
                "hash": "0xabc2",
                "from_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                "to_address": "0x2222222222222222222222222222222222222222",
                "value_eth": 1.2,
                "timestamp": now - 1800,
                "is_error": False
            }
        ]
    }
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target_identifier"] == "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    assert "features" in data
    assert "rules" in data
    assert "anomaly_detection" in data
    assert "risk_assessment" in data
    assert data["risk_assessment"]["risk_classification"] in [
        "No Major Anomaly Detected",
        "Unusual Activity",
        "Requires Further Review",
        "Insufficient Data"
    ]
