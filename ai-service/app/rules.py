from typing import List, Dict, Any
from app.schemas import TransactionRecord, FeatureSet, RuleResult

# Documented Configurable Baselines
DEFAULT_THRESHOLDS = {
    "rapid_onward_ratio_high": 0.40,
    "rapid_onward_ratio_crit": 0.75,
    "tx_frequency_per_day_high": 50.0,
    "burst_score_high": 3.0,
    "counterparty_entropy_high": 2.8,
    "counterparty_fanout_ratio": 0.80,
    "failed_tx_ratio_high": 0.20,
    "asymmetric_drain_ratio": 0.90,
    "large_single_tx_eth": 10.0,
}

def evaluate_rules(
    target: str,
    features: FeatureSet,
    transactions: List[TransactionRecord],
    thresholds: Dict[str, float] = DEFAULT_THRESHOLDS
) -> List[RuleResult]:
    target_lower = target.lower()
    results: List[RuleResult] = []
    
    # If no transactions or empty history
    if not transactions or features.tx_count == 0:
        return results

    # Helper: get relevant transaction hashes
    tx_hashes = [tx.hash for tx in transactions]

    # 1. Rapid Onward Flow / Layering Rule
    rapid_ratio = features.rapid_onward_ratio
    rapid_supporting_hashes = []
    for i in range(len(transactions) - 1):
        curr = transactions[i]
        nxt = transactions[i+1]
        if (curr.to_address or "").lower() == target_lower and (nxt.from_address or "").lower() == target_lower:
            if 0 <= (nxt.timestamp - curr.timestamp) <= 3600:
                rapid_supporting_hashes.append(curr.hash)
                rapid_supporting_hashes.append(nxt.hash)
                
    rapid_supporting_hashes = list(dict.fromkeys(rapid_supporting_hashes))[:10]
    
    is_rapid = rapid_ratio >= thresholds["rapid_onward_ratio_high"]
    results.append(RuleResult(
        rule_id="RULE_RAPID_PEELING_FLOW",
        rule_name="Rapid Fund Pass-Through / Peeling Behavior",
        severity="HIGH" if rapid_ratio < thresholds["rapid_onward_ratio_crit"] else "CRITICAL",
        triggered=is_rapid,
        observed_value=f"{rapid_ratio * 100:.1f}% rapid relay ratio",
        threshold=f">= {thresholds['rapid_onward_ratio_high'] * 100:.0f}%",
        explanation=(
            f"Observed {rapid_ratio * 100:.1f}% of incoming fund transfers were immediately "
            "forwarded to another address within 60 minutes. This behavior is consistent with transit/peeling accounts, "
            "hot wallets, or automated relay nodes." if is_rapid else
            "Fund pass-through timing is within expected normal temporal distributions."
        ),
        supporting_txs=rapid_supporting_hashes if is_rapid else []
    ))

    # 2. Transaction Velocity & Clustering Burst Rule
    is_burst = features.burst_score >= thresholds["burst_score_high"] or features.tx_frequency_per_day >= thresholds["tx_frequency_per_day_high"]
    results.append(RuleResult(
        rule_id="RULE_HIGH_VELOCITY_BURST",
        rule_name="High Velocity Transaction Clustering",
        severity="MEDIUM",
        triggered=is_burst,
        observed_value=f"Burst: {features.burst_score:.2f}, Frequency: {features.tx_frequency_per_day:.1f} tx/day",
        threshold=f"Burst >= {thresholds['burst_score_high']} OR Freq >= {thresholds['tx_frequency_per_day_high']} tx/day",
        explanation=(
            f"High transaction clustering index ({features.burst_score:.2f}) indicates non-human automated script, "
            "bot execution, or concentrated liquidation events." if is_burst else
            "Transaction velocity and temporal spread are consistent with steady organic activity."
        ),
        supporting_txs=tx_hashes[:5] if is_burst else []
    ))

    # 3. High Counterparty Fan-Out Dispersion
    fanout_ratio = (features.unique_counterparties / max(1, features.tx_count))
    is_fanout = features.unique_counterparties >= 5 and (
        fanout_ratio >= thresholds["counterparty_fanout_ratio"] or 
        features.counterparty_entropy >= thresholds["counterparty_entropy_high"]
    )
    results.append(RuleResult(
        rule_id="RULE_HIGH_COUNTERPARTY_FANOUT",
        rule_name="High Counterparty Dispersion",
        severity="MEDIUM",
        triggered=is_fanout,
        observed_value=f"{features.unique_counterparties} unique counterparties (Entropy: {features.counterparty_entropy:.2f})",
        threshold=f">= {thresholds['counterparty_fanout_ratio']*100:.0f}% unique or Entropy >= {thresholds['counterparty_entropy_high']}",
        explanation=(
            f"Address interacted with {features.unique_counterparties} distinct counterparties with high Shannon entropy "
            f"({features.counterparty_entropy:.2f}), showing high dispersion often associated with airdrop distribution, "
            "sweeping operations, or service pools." if is_fanout else
            "Counterparty distribution indicates regular bilateral or concentrated entity interactions."
        ),
        supporting_txs=tx_hashes[:5] if is_fanout else []
    ))

    # 4. Elevated Reversion / Failure Rate
    is_failed = features.failed_tx_ratio >= thresholds["failed_tx_ratio_high"] and features.tx_count >= 3
    failed_hashes = [tx.hash for tx in transactions if tx.is_error][:5]
    results.append(RuleResult(
        rule_id="RULE_ELEVATED_FAILURE_RATE",
        rule_name="Elevated Transaction Execution Reversion",
        severity="HIGH" if features.failed_tx_ratio > 0.5 else "MEDIUM",
        triggered=is_failed,
        observed_value=f"{features.failed_tx_ratio * 100:.1f}% failed transactions",
        threshold=f">= {thresholds['failed_tx_ratio_high'] * 100:.0f}% failure rate",
        explanation=(
            f"{features.failed_tx_ratio * 100:.1f}% of transactions reverted or encountered EVM execution errors. "
            "Elevated failure rates often correlate with contract exploit testing, frontrunning bot competition, or misconfigured scripts." if is_failed else
            "Transaction execution success rate is healthy and within standard tolerances."
        ),
        supporting_txs=failed_hashes if is_failed else []
    ))

    # 5. Asymmetric Inflow Drain Rule
    is_drain = (
        features.in_eth > 1.0 and
        features.out_eth > 0.9 * features.in_eth and
        features.out_count > 0 and
        (features.out_eth / max(0.0001, features.in_eth)) >= thresholds["asymmetric_drain_ratio"]
    )
    results.append(RuleResult(
        rule_id="RULE_ASYMMETRIC_DRAIN",
        rule_name="Near-Complete Inflow Depletion (Drain / Sweep)",
        severity="HIGH",
        triggered=is_drain,
        observed_value=f"In: {features.in_eth:.4f} ETH, Out: {features.out_eth:.4f} ETH ({min(100.0, (features.out_eth/max(0.0001, features.in_eth))*100):.1f}% drained)",
        threshold=f">= {thresholds['asymmetric_drain_ratio']*100:.0f}% of total inflow drained",
        explanation=(
            f"Over {thresholds['asymmetric_drain_ratio']*100:.0f}% of all deposited funds ({features.out_eth:.4f} / {features.in_eth:.4f} ETH) "
            "were systematically extracted, leaving minimal residual balance. Typical of intermediary collection or sweep wallets." if is_drain else
            "Address retains a normal proportion of funds or has steady balanced inflows/outflows."
        ),
        supporting_txs=tx_hashes[:5] if is_drain else []
    ))

    # 6. High Value Single Transaction Flag
    high_val_txs = [tx.hash for tx in transactions if tx.value_eth >= thresholds["large_single_tx_eth"]]
    is_high_val = len(high_val_txs) > 0
    results.append(RuleResult(
        rule_id="RULE_LARGE_VALUE_TRANSFER",
        rule_name="Significant Single Value Transfer",
        severity="INFO" if features.max_value_eth < 50.0 else "MEDIUM",
        triggered=is_high_val,
        observed_value=f"Peak single transfer: {features.max_value_eth:.4f} ETH",
        threshold=f">= {thresholds['large_single_tx_eth']} ETH",
        explanation=(
            f"Detected transfer of {features.max_value_eth:.4f} ETH, exceeding the {thresholds['large_single_tx_eth']} ETH significance marker. "
            "Requires context regarding entity capitalization." if is_high_val else
            "No individual transactions exceeded large value significance thresholds."
        ),
        supporting_txs=high_val_txs[:5] if is_high_val else []
    ))

    return results
