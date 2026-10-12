"""
Model Evaluation and Metric Extraction Script
"""

import os
import sys
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from training.train_model import generate_reference_dataset

def evaluate(model_path: str = None):
    model_path = model_path or os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "rf_classifier.joblib")
    if not os.path.exists(model_path):
        print(f"Model artifact not found at {model_path}")
        return

    loaded = joblib.load(model_path)
    model = loaded["model"] if isinstance(loaded, dict) else loaded
    metadata = loaded.get("metadata", {}) if isinstance(loaded, dict) else {}

    print(f"Evaluating Model: {metadata.get('name', 'Random Forest')} v{metadata.get('version', '1.0.0')}")

    # Generate fresh validation test batch
    df = generate_reference_dataset(n_samples=500)
    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].values
    y = df["label"].values

    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)[:, 1] if hasattr(model, "predict_proba") else None

    print("\n" + "="*50)
    print("INDEPENDENT VALIDATION REPORT:")
    print("="*50)
    print(classification_report(y, y_pred, target_names=["Benign / Normal", "Suspicious / High Risk"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y, y_pred))
    if y_proba is not None:
        auc = roc_auc_score(y, y_proba)
        print(f"ROC-AUC Score: {auc:.4f}")

if __name__ == "__main__":
    evaluate()
