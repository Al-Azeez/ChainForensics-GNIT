from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TransactionRecord(BaseModel):
    hash: str
    from_address: str
    to_address: Optional[str] = None
    value_eth: float = 0.0
    timestamp: int  # Unix timestamp in seconds
    block_number: Optional[int] = None
    gas_price_gwei: Optional[float] = None
    gas_used: Optional[int] = None
    is_error: bool = False
    method: Optional[str] = None
    token_symbol: Optional[str] = None
    token_value: Optional[float] = None

class AnalysisRequest(BaseModel):
    target_identifier: str
    target_type: str = Field(default="address", pattern="^(address|transaction)$")
    transactions: List[TransactionRecord] = []
    analysis_scope: str = "standard"
    network: str = "ethereum"

class FeatureSet(BaseModel):
    tx_count: int
    in_count: int
    out_count: int
    in_eth: float
    out_eth: float
    avg_value_eth: float
    max_value_eth: float
    std_value_eth: float
    unique_counterparties: int
    counterparty_entropy: float
    tx_frequency_per_day: float
    min_time_diff_sec: float
    mean_time_diff_sec: float
    rapid_onward_ratio: float
    failed_tx_ratio: float
    burst_score: float
    net_flow_eth: float
    feature_definitions: Dict[str, str]

class RuleResult(BaseModel):
    rule_id: str
    rule_name: str
    severity: str  # 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
    triggered: bool
    observed_value: Any
    threshold: Any
    explanation: str
    supporting_txs: List[str]

class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float  # Normalized 0.0 (normal) to 1.0 (highly anomalous)
    confidence: float
    method: str = "IsolationForest"
    explanation: str
    baseline_description: str

class MLPrediction(BaseModel):
    is_available: bool
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    prediction_label: Optional[str] = None
    confidence: Optional[float] = None
    class_probabilities: Optional[Dict[str, float]] = None
    status_message: str

class RiskAssessment(BaseModel):
    risk_score: Optional[float] = None  # 0 to 100
    risk_classification: str  # 'Insufficient Data' | 'No Major Anomaly Detected' | 'Unusual Activity' | 'Requires Further Review'
    confidence_score: float  # 0.0 to 1.0
    evidence_summary: List[str]
    limitations: List[str]
    scoring_methodology: str
    ruleset_version: str

class AnalysisResponse(BaseModel):
    target_identifier: str
    target_type: str
    network: str
    timestamp: int
    data_completeness: str  # 'FULL_SAMPLED' | 'SINGLE_TRANSACTION' | 'PARTIAL_HISTORY'
    record_count: int
    features: FeatureSet
    rules: List[RuleResult]
    anomaly_detection: AnomalyResult
    ml_prediction: MLPrediction
    risk_assessment: RiskAssessment
