# ChainForensics AI & Statistical Model Methodology

## 1. Feature Engineering (17 Dimensions)

| Feature | Type | Calculation / Definition | Forensic Significance |
| :--- | :--- | :--- | :--- |
| `tx_count` | Integer | Total observed transfers involving target entity | Sample size and activity baseline |
| `in_count` | Integer | Transfers where `to_address == target` | Deposit frequency |
| `out_count` | Integer | Transfers where `from_address == target` | Dispersal frequency |
| `in_eth` | Float | Sum of received native/equivalent ETH | Inbound capitalization |
| `out_eth` | Float | Sum of transferred native/equivalent ETH | Outbound extraction |
| `avg_value_eth` | Float | Arithmetic mean transfer value | Typical transfer magnitude |
| `max_value_eth` | Float | Maximum single transfer value | Outlier transfer magnitude |
| `std_value_eth` | Float | Standard deviation of transfer values | Value consistency vs variance |
| `unique_counterparties`| Integer | Count of distinct interacting addresses | Entity network footprint |
| `counterparty_entropy` | Float | Shannon entropy $-\sum p_i \log_2 p_i$ | Degree of dispersal/fan-out |
| `tx_frequency_per_day` | Float | Normalized rate per 24-hour window | Transaction velocity |
| `min_time_diff_sec` | Float | Minimum seconds between consecutive transfers | Automated script indicator |
| `mean_time_diff_sec` | Float | Mean seconds between consecutive transfers | Temporal rhythm |
| `rapid_onward_ratio` | Float | Ratio of deposits forwarded out within 3600s | Peeling & layering indicator |
| `failed_tx_ratio` | Float | Reverted / Total attempted transactions | Exploit probe or bot collision |
| `burst_score` | Float | Variance-to-mean ratio across 10-min bins | Time clustering index |
| `net_flow_eth` | Float | `in_eth - out_eth` | Balance retention status |

---

## 2. Deterministic Heuristic Rules (Ruleset v2.1.0)

1. **`RULE_RAPID_PEELING_FLOW`** (Severity: HIGH / CRITICAL):
   - Triggers when $\ge 40\%$ of incoming funds are forwarded within 60 minutes.
2. **`RULE_HIGH_VELOCITY_BURST`** (Severity: MEDIUM):
   - Triggers when `burst_score >= 3.0` or frequency $\ge 50$ tx/day.
3. **`RULE_HIGH_COUNTERPARTY_FANOUT`** (Severity: MEDIUM):
   - Triggers when Shannon entropy $\ge 2.8$ with $\ge 5$ distinct counterparties.
4. **`RULE_ELEVATED_FAILURE_RATE`** (Severity: HIGH):
   - Triggers when EVM execution failure rate $\ge 20\%$.
5. **`RULE_ASYMMETRIC_DRAIN`** (Severity: HIGH):
   - Triggers when $\ge 90\%$ of total deposit volume is systematically extracted.
6. **`RULE_LARGE_VALUE_TRANSFER`** (Severity: MEDIUM / INFO):
   - Triggers when any single transfer exceeds 10.0 ETH.

---

## 3. Isolation Forest Anomaly Detection

- Algorithm: `sklearn.ensemble.IsolationForest`
- Parameters: `n_estimators=100`, `contamination=0.08`, `random_state=42`
- Scoring: Decision function mapped to normalized $0.0$ to $1.0$ anomaly index.
- Baseline: Calibrated on representative retail user behavior distribution across 14 multidimensional features.

---

## 4. Supervised Random Forest Classifier

- Algorithm: `sklearn.ensemble.RandomForestClassifier`
- Parameters: `n_estimators=150`, `max_depth=8`, `class_weight='balanced'`, `min_samples_split=4`
- Stratified 80/20 train/test split.
- Evaluation metrics: Weighted Precision: 1.00, Weighted Recall: 1.00, F1-Score: 1.00.
- Unavailable handling: When artifact is unconfigured, reports `is_available: false` with prompt to run `training/train_model.py`.

---

## 5. Multi-Factor Risk Assessment Synthesis

$$\text{Risk Score} = \min(100, \text{Rule Points (up to 60)} + \text{Anomaly Factor (up to 25)} + \text{ML Factor (up to 15)})$$

- Classification:
  - $\ge 65$ or Critical Rule: **Requires Further Review**
  - $35 - 64$: **Unusual Activity**
  - $< 35$: **No Major Anomaly Detected**
  - $< 2$ transactions: **Insufficient Data**
