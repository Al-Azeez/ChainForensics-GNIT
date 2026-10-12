from typing import List, Optional
from app.schemas import FeatureSet, RuleResult, AnomalyResult, MLPrediction, RiskAssessment

RULESET_VERSION = "2.1.0-explainable"

def assess_risk(
    features: FeatureSet,
    rules: List[RuleResult],
    anomaly: AnomalyResult,
    ml: MLPrediction,
    data_completeness: str
) -> RiskAssessment:
    limitations: List[str] = [
        "Automated risk scoring represents statistical heuristics and anomaly markers, NOT legal proof of illicit activity.",
        "Analysis is constrained to the retrieved block window and publicly indexed transaction records.",
        "Off-chain transactions, decentralized privacy pools, and layer-2 bridging can obscure comprehensive asset provenance."
    ]
    
    # 1. Check for Insufficient Data condition
    if features.tx_count < 2 or data_completeness == "INSUFFICIENT":
        return RiskAssessment(
            risk_score=None,
            risk_classification="Insufficient Data",
            confidence_score=0.15,
            evidence_summary=[
                f"Observed only {features.tx_count} transaction(s). Minimum threshold for reliable forensic risk profiling is 2 or more complete transactions."
            ],
            limitations=limitations,
            scoring_methodology="Requires at least 2 verified transactions to construct temporal intervals and flow vectors.",
            ruleset_version=RULESET_VERSION
        )

    # 2. Compute Rule-based Weight Factor (0 to 60 points)
    triggered_rules = [r for r in rules if r.triggered]
    rule_points = 0.0
    evidence_items: List[str] = []

    for r in triggered_rules:
        if r.severity == "CRITICAL":
            rule_points += 30.0
            evidence_items.append(f"[CRITICAL RULE] {r.rule_name}: {r.explanation}")
        elif r.severity == "HIGH":
            rule_points += 20.0
            evidence_items.append(f"[HIGH RULE] {r.rule_name}: {r.explanation}")
        elif r.severity == "MEDIUM":
            rule_points += 10.0
            evidence_items.append(f"[MEDIUM RULE] {r.rule_name}: {r.explanation}")
        elif r.severity == "LOW":
            rule_points += 5.0
            evidence_items.append(f"[LOW RULE] {r.rule_name}: {r.explanation}")

    rule_score = min(60.0, rule_points)

    # 3. Compute Anomaly Isolation Factor (0 to 25 points)
    anomaly_score_contribution = 0.0
    if anomaly.is_anomaly:
        anomaly_score_contribution = float(anomaly.anomaly_score * 25.0)
        evidence_items.append(f"[ANOMALY ISOLATION] {anomaly.explanation}")
    else:
        anomaly_score_contribution = float(anomaly.anomaly_score * 10.0)

    # 4. Compute Supervised ML Factor (0 to 15 points) if available
    ml_score_contribution = 0.0
    if ml.is_available and ml.confidence is not None:
        if ml.prediction_label and "Suspicious" in ml.prediction_label:
            ml_score_contribution = float(ml.confidence * 15.0)
            evidence_items.append(f"[ML CLASSIFIER] Random Forest predicted {ml.prediction_label} with {ml.confidence*100:.1f}% confidence.")
        else:
            ml_score_contribution = float((1.0 - ml.confidence) * 10.0)
    else:
        # Reallocate ML points gracefully into rule sensitivity weight
        rule_score = min(75.0, rule_score * 1.25)

    raw_total_score = rule_score + anomaly_score_contribution + ml_score_contribution
    total_score = round(min(100.0, max(0.0, raw_total_score)), 1)

    # Classification Mapping
    if total_score >= 65.0 or any(r.severity == "CRITICAL" for r in triggered_rules):
        classification = "Requires Further Review"
    elif total_score >= 35.0:
        classification = "Unusual Activity"
    else:
        classification = "No Major Anomaly Detected"

    # Confidence calculation based on sample count & consistency
    data_quality_factor = min(1.0, features.tx_count / 15.0)
    confidence = round(0.40 + (0.50 * data_quality_factor), 2)

    if not evidence_items:
        evidence_items.append("Transaction flow, velocity, and counterparty dispersion adhere to typical baseline behaviors.")

    return RiskAssessment(
        risk_score=total_score,
        risk_classification=classification,
        confidence_score=confidence,
        evidence_summary=evidence_items,
        limitations=limitations,
        scoring_methodology="Multi-Factor Synthesis: Rule Severity (60% weight) + Isolation Forest Anomaly (25% weight) + ML Ensemble (15% weight).",
        ruleset_version=RULESET_VERSION
    )
