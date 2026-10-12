"""
Reproducible Training Pipeline for ChainForensics Supervised Classifier
Trains a balanced Random Forest Classifier on labeled blockchain feature vectors.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
import joblib

# Ensure app package is accessible
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def generate_reference_dataset(n_samples: int = 1200) -> pd.DataFrame:
    """
    Generates a calibrated benchmark training dataset reflecting known topological and
    behavioral characteristics of normal vs suspicious Ethereum transaction profiles.
    Used when empirical or external labeled CSV datasets are not separately mounted.
    """
    np.random.seed(42)
    n_benign = int(n_samples * 0.70)
    n_suspicious = n_samples - n_benign

    # 1. Benign / Regular Retail Accounts
    tx_count_b = np.random.exponential(scale=15, size=n_benign) + 2
    in_eth_b = np.random.exponential(scale=5.0, size=n_benign) + 0.1
    out_eth_b = in_eth_b * np.random.uniform(0.1, 0.85, size=n_benign)
    avg_val_b = (in_eth_b + out_eth_b) / np.maximum(tx_count_b, 1)
    max_val_b = avg_val_b * np.random.uniform(1.2, 3.5, size=n_benign)
    std_val_b = avg_val_b * 0.4
    counterparties_b = np.clip(tx_count_b * np.random.uniform(0.2, 0.6, size=n_benign), 1, 80)
    entropy_b = np.random.uniform(0.2, 2.2, size=n_benign)
    freq_b = np.random.exponential(scale=2.5, size=n_benign) + 0.1
    min_time_b = np.random.exponential(scale=7200, size=n_benign) + 60
    mean_time_b = min_time_b * np.random.uniform(2.0, 15.0, size=n_benign)
    rapid_ratio_b = np.random.beta(a=0.5, b=6.0, size=n_benign) * 0.2
    failed_ratio_b = np.random.beta(a=0.5, b=10.0, size=n_benign) * 0.08
    burst_score_b = np.random.exponential(scale=0.9, size=n_benign)
    labels_b = [0] * n_benign

    # 2. Suspicious / Layering / Exploit / Rapid Peeling Accounts
    tx_count_s = np.random.exponential(scale=35, size=n_suspicious) + 5
    in_eth_s = np.random.exponential(scale=25.0, size=n_suspicious) + 1.0
    out_eth_s = in_eth_s * np.random.uniform(0.92, 0.999, size=n_suspicious)
    avg_val_s = (in_eth_s + out_eth_s) / np.maximum(tx_count_s, 1)
    max_val_s = avg_val_s * np.random.uniform(2.5, 8.0, size=n_suspicious)
    std_val_s = avg_val_s * 0.9
    counterparties_s = np.clip(tx_count_s * np.random.uniform(0.7, 0.98, size=n_suspicious), 2, 150)
    entropy_s = np.random.uniform(2.5, 4.8, size=n_suspicious)
    freq_s = np.random.exponential(scale=45.0, size=n_suspicious) + 10.0
    min_time_s = np.random.exponential(scale=45, size=n_suspicious) + 2
    mean_time_s = min_time_s * np.random.uniform(1.2, 4.0, size=n_suspicious)
    rapid_ratio_s = np.random.beta(a=5.0, b=1.5, size=n_suspicious) * 0.9 + 0.1
    failed_ratio_s = np.random.beta(a=1.5, b=4.0, size=n_suspicious) * 0.4
    burst_score_s = np.random.exponential(scale=4.5, size=n_suspicious) + 2.0
    labels_s = [1] * n_suspicious

    df = pd.DataFrame({
        "tx_count": np.concatenate([tx_count_b, tx_count_s]),
        "in_eth": np.concatenate([in_eth_b, in_eth_s]),
        "out_eth": np.concatenate([out_eth_b, out_eth_s]),
        "avg_value_eth": np.concatenate([avg_val_b, avg_val_s]),
        "max_value_eth": np.concatenate([max_val_b, max_val_s]),
        "std_value_eth": np.concatenate([std_val_b, std_val_s]),
        "unique_counterparties": np.concatenate([counterparties_b, counterparties_s]),
        "counterparty_entropy": np.concatenate([entropy_b, entropy_s]),
        "tx_frequency_per_day": np.concatenate([freq_b, freq_s]),
        "min_time_diff_sec": np.concatenate([min_time_b, min_time_s]),
        "mean_time_diff_sec": np.concatenate([mean_time_b, mean_time_s]),
        "rapid_onward_ratio": np.concatenate([rapid_ratio_b, rapid_ratio_s]),
        "failed_tx_ratio": np.concatenate([failed_ratio_b, failed_ratio_s]),
        "burst_score": np.concatenate([burst_score_b, burst_score_s]),
        "label": np.concatenate([labels_b, labels_s])
    })
    return df

def train_and_export(output_path: str = None, dataset_path: str = None):
    output_path = output_path or os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "rf_classifier.joblib")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if dataset_path and os.path.exists(dataset_path):
        print(f"Loading external dataset from {dataset_path}...")
        df = pd.read_csv(dataset_path)
    else:
        print("Generating calibrated benchmark training dataset...")
        df = generate_reference_dataset(n_samples=1500)

    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].values
    y = df["label"].values

    # Stratified Train/Test Separation (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Dataset split: Train={len(X_train)} samples, Test={len(X_test)} samples")
    print(f"Class distribution: Benign={np.sum(y == 0)}, Suspicious={np.sum(y == 1)}")

    # Balanced Random Forest
    rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    # Evaluation
    y_pred = rf.predict(X_test)
    report = classification_report(y_test, y_pred, target_names=["Benign / Normal", "Suspicious / High Risk"])
    cm = confusion_matrix(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")

    print("\n" + "="*50)
    print("MODEL EVALUATION RESULTS:")
    print("="*50)
    print(report)
    print("Confusion Matrix:")
    print(cm)
    print(f"Weighted F1-Score: {f1:.4f}")

    # Package Artifact
    artifact = {
        "model": rf,
        "metadata": {
            "name": "Random Forest Blockchain Risk Classifier",
            "version": "1.0.0",
            "classes": ["Benign / Normal", "Suspicious / High Risk"],
            "features": feature_cols,
            "metrics": {
                "weighted_precision": round(float(prec), 4),
                "weighted_recall": round(float(rec), 4),
                "weighted_f1": round(float(f1), 4),
                "confusion_matrix": cm.tolist()
            },
            "parameters": {
                "n_estimators": 150,
                "max_depth": 8,
                "class_weight": "balanced"
            }
        }
    }

    joblib.dump(artifact, output_path)
    print(f"\nModel artifact successfully saved to: {output_path}")
    return artifact

if __name__ == "__main__":
    train_and_export()
