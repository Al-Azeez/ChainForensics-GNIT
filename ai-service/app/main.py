import time
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalysisRequest, AnalysisResponse, FeatureSet
from app.features import extract_features, FEATURE_DEFINITIONS
from app.rules import evaluate_rules, DEFAULT_THRESHOLDS
from app.anomaly_service import detect_anomaly
from app.model_service import get_model_manager
from app.risk import assess_risk, RULESET_VERSION

app = FastAPI(
    title="ChainForensics AI Analysis Service",
    description="Machine Learning & Heuristic Transaction Forensics Engine for Blockchain Intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "ChainForensics AI Engine",
        "status": "online",
        "version": "1.0.0",
        "ruleset_version": RULESET_VERSION
    }

@app.get("/health")
def health_check():
    model_mgr = get_model_manager()
    is_model_loaded = model_mgr.model is not None
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "engine": "FastAPI + scikit-learn",
        "modules": {
            "feature_extractor": "ready",
            "rule_engine": "ready",
            "anomaly_detector": "ready (IsolationForest)",
            "supervised_ml": "ready" if is_model_loaded else "unconfigured_artifact"
        },
        "model_loaded": is_model_loaded,
        "rules_count": 6
    }

@app.get("/rules")
def get_rules_catalog():
    return {
        "ruleset_version": RULESET_VERSION,
        "thresholds": DEFAULT_THRESHOLDS,
        "feature_definitions": FEATURE_DEFINITIONS
    }

@app.post("/features", response_model=FeatureSet)
def get_features(req: AnalysisRequest):
    try:
        features = extract_features(
            target=req.target_identifier,
            target_type=req.target_type,
            transactions=req.transactions
        )
        return features
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Feature extraction error: {str(e)}"
        )

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_transaction_data(req: AnalysisRequest):
    try:
        # 1. Feature Extraction
        features = extract_features(
            target=req.target_identifier,
            target_type=req.target_type,
            transactions=req.transactions
        )

        # 2. Rule-Based Evaluation
        rules_results = evaluate_rules(
            target=req.target_identifier,
            features=features,
            transactions=req.transactions
        )

        # 3. Isolation Forest Anomaly Detection
        anomaly_res = detect_anomaly(features)

        # 4. Supervised Random Forest Classifier
        model_mgr = get_model_manager()
        ml_res = model_mgr.predict(features)

        # Determine data completeness tag
        if len(req.transactions) == 0:
            completeness = "NO_DATA"
        elif req.target_type == "transaction" or len(req.transactions) == 1:
            completeness = "SINGLE_TRANSACTION"
        elif len(req.transactions) >= 50:
            completeness = "SAMPLE_CAPPED_HISTORY"
        else:
            completeness = "AVAILABLE_HISTORY"

        # 5. Risk Assessment Engine
        risk_res = assess_risk(
            features=features,
            rules=rules_results,
            anomaly=anomaly_res,
            ml=ml_res,
            data_completeness=completeness
        )

        return AnalysisResponse(
            target_identifier=req.target_identifier,
            target_type=req.target_type,
            network=req.network,
            timestamp=int(time.time()),
            data_completeness=completeness,
            record_count=len(req.transactions),
            features=features,
            rules=rules_results,
            anomaly_detection=anomaly_res,
            ml_prediction=ml_res,
            risk_assessment=risk_res
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forensic analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
