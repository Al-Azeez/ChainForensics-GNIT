import math
from typing import List, Dict, Any, Tuple
import numpy as np
from app.schemas import TransactionRecord, FeatureSet

FEATURE_DEFINITIONS: Dict[str, str] = {
    "tx_count": "Total count of observed transactions for the target entity.",
    "in_count": "Number of incoming fund transfers received by the target address.",
    "out_count": "Number of outgoing fund transfers dispatched from the target address.",
    "in_eth": "Cumulative incoming native/equivalent value in ETH.",
    "out_eth": "Cumulative outgoing native/equivalent value in ETH.",
    "avg_value_eth": "Arithmetic mean transaction value in ETH across observed transfers.",
    "max_value_eth": "Maximum single transaction transfer value observed.",
    "std_value_eth": "Standard deviation of observed transfer amounts in ETH.",
    "unique_counterparties": "Distinct interacting wallet/contract addresses in the dataset.",
    "counterparty_entropy": "Shannon entropy score of counterparty interaction distribution (higher implies dispersion).",
    "tx_frequency_per_day": "Normalized transaction event rate per 24-hour window.",
    "min_time_diff_sec": "Minimum elapsed time interval between consecutive transaction events in seconds.",
    "mean_time_diff_sec": "Average elapsed time interval between consecutive transactions in seconds.",
    "rapid_onward_ratio": "Proportion of incoming transfers followed by an outgoing transfer within 1 hour (3600s).",
    "failed_tx_ratio": "Ratio of reverted/error transactions to total attempted transactions.",
    "burst_score": "Standardized index of transaction clustering in short time intervals.",
    "net_flow_eth": "Net fund differential (in_eth minus out_eth)."
}

def calculate_entropy(counts: List[int]) -> float:
    total = sum(counts)
    if total <= 0:
        return 0.0
    probs = [c / total for c in counts if c > 0]
    return -sum(p * math.log2(p) for p in probs)

def extract_features(target: str, target_type: str, transactions: List[TransactionRecord]) -> FeatureSet:
    target_lower = target.lower()
    
    if not transactions:
        return FeatureSet(
            tx_count=0,
            in_count=0,
            out_count=0,
            in_eth=0.0,
            out_eth=0.0,
            avg_value_eth=0.0,
            max_value_eth=0.0,
            std_value_eth=0.0,
            unique_counterparties=0,
            counterparty_entropy=0.0,
            tx_frequency_per_day=0.0,
            min_time_diff_sec=0.0,
            mean_time_diff_sec=0.0,
            rapid_onward_ratio=0.0,
            failed_tx_ratio=0.0,
            burst_score=0.0,
            net_flow_eth=0.0,
            feature_definitions=FEATURE_DEFINITIONS
        )

    # Sort chronologically
    sorted_txs = sorted(transactions, key=lambda t: t.timestamp)
    
    values: List[float] = []
    in_eth = 0.0
    out_eth = 0.0
    in_count = 0
    out_count = 0
    failed_count = 0
    counterparty_map: Dict[str, int] = {}
    
    for tx in sorted_txs:
        val = float(tx.value_eth or 0.0)
        values.append(val)
        if tx.is_error:
            failed_count += 1
            
        f_addr = (tx.from_address or "").lower()
        t_addr = (tx.to_address or "").lower() if tx.to_address else ""
        
        if target_type == "address":
            if f_addr == target_lower:
                out_count += 1
                out_eth += val
                if t_addr:
                    counterparty_map[t_addr] = counterparty_map.get(t_addr, 0) + 1
            elif t_addr == target_lower:
                in_count += 1
                in_eth += val
                if f_addr:
                    counterparty_map[f_addr] = counterparty_map.get(f_addr, 0) + 1
            else:
                # Transitive transaction related to target
                if f_addr:
                    counterparty_map[f_addr] = counterparty_map.get(f_addr, 0) + 1
                if t_addr:
                    counterparty_map[t_addr] = counterparty_map.get(t_addr, 0) + 1
        else:
            # Single or target transaction mode
            if f_addr:
                counterparty_map[f_addr] = counterparty_map.get(f_addr, 0) + 1
            if t_addr:
                counterparty_map[t_addr] = counterparty_map.get(t_addr, 0) + 1
            in_eth += val
            in_count += 1

    tx_count = len(sorted_txs)
    avg_val = float(np.mean(values)) if values else 0.0
    max_val = float(np.max(values)) if values else 0.0
    std_val = float(np.std(values)) if len(values) > 1 else 0.0
    failed_ratio = failed_count / tx_count if tx_count > 0 else 0.0

    # Counterparties & Entropy
    unique_counterparties = len(counterparty_map)
    counterparty_entropy = calculate_entropy(list(counterparty_map.values()))

    # Time dynamics
    timestamps = [t.timestamp for t in sorted_txs]
    time_diffs: List[float] = []
    for i in range(1, len(timestamps)):
        diff = max(0, timestamps[i] - timestamps[i-1])
        time_diffs.append(float(diff))

    min_time_diff = float(min(time_diffs)) if time_diffs else 0.0
    mean_time_diff = float(np.mean(time_diffs)) if time_diffs else 0.0
    
    # Frequency per day
    if len(timestamps) > 1:
        span_sec = max(1, timestamps[-1] - timestamps[0])
        span_days = max(span_sec / 86400.0, 1.0 / 24.0)
        tx_freq_per_day = tx_count / span_days
    else:
        tx_freq_per_day = 1.0

    # Rapid Onward Ratio (Inflow followed by Outflow within 3600s)
    rapid_transfers = 0
    for i in range(len(sorted_txs) - 1):
        curr_tx = sorted_txs[i]
        next_tx = sorted_txs[i + 1]
        
        curr_to = (curr_tx.to_address or "").lower()
        next_from = (next_tx.from_address or "").lower()
        
        # Inflow to target, then outflow from target within 1 hour
        if curr_to == target_lower and next_from == target_lower:
            time_delta = next_tx.timestamp - curr_tx.timestamp
            if 0 <= time_delta <= 3600:
                rapid_transfers += 1
                
    rapid_onward_ratio = (rapid_transfers / max(1, in_count)) if in_count > 0 else 0.0

    # Burst score (Variance-to-mean ratio of 10-minute bins)
    burst_score = 0.0
    if len(timestamps) > 3 and (timestamps[-1] - timestamps[0]) > 600:
        bin_size = 600 # 10 mins
        start_t = timestamps[0]
        end_t = timestamps[-1]
        num_bins = max(1, int((end_t - start_t) / bin_size) + 1)
        bins = [0] * num_bins
        for t in timestamps:
            idx = min(num_bins - 1, int((t - start_t) / bin_size))
            bins[idx] += 1
        mean_b = np.mean(bins)
        var_b = np.var(bins)
        burst_score = float(var_b / mean_b) if mean_b > 0 else 0.0

    return FeatureSet(
        tx_count=tx_count,
        in_count=in_count,
        out_count=out_count,
        in_eth=round(in_eth, 6),
        out_eth=round(out_eth, 6),
        avg_value_eth=round(avg_val, 6),
        max_value_eth=round(max_val, 6),
        std_value_eth=round(std_val, 6),
        unique_counterparties=unique_counterparties,
        counterparty_entropy=round(counterparty_entropy, 4),
        tx_frequency_per_day=round(tx_freq_per_day, 2),
        min_time_diff_sec=round(min_time_diff, 1),
        mean_time_diff_sec=round(mean_time_diff, 1),
        rapid_onward_ratio=round(rapid_onward_ratio, 4),
        failed_tx_ratio=round(failed_ratio, 4),
        burst_score=round(burst_score, 3),
        net_flow_eth=round(in_eth - out_eth, 6),
        feature_definitions=FEATURE_DEFINITIONS
    )
