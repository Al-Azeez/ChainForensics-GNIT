import os
from typing import Optional, Dict, Any
import numpy as np
import joblib
from app.schemas import FeatureSet, MLPrediction
from app.anomaly_service import features_to_vector

MODEL_PATH_DEFAULT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "rf_classifier.joblib")

class MLModelManager:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.getenv("MODEL_PATH", MODEL_PATH_DEFAULT)
        self.model = None
        self.model_metadata = {}
        self.load_model()

    def load_model(self) -> bool:
        if os.path.exists(self.model_path):
            try:
                loaded = joblib.load(self.model_path)
                if isinstance(loaded, dict) and "model" in loaded:
                    self.model = loaded["model"]
                    self.model_metadata = loaded.get("metadata", {})
                else:
                    self.model = loaded
                    self.model_metadata = {
                        "name": "Random Forest Blockchain Classifier",
                        "version": "1.0.0",
                        "classes": ["Benign / Normal", "Suspicious / High Risk"]
                    }
                return True
            except Exception as e:
                print(f"Error loading ML model from {self.model_path}: {e}")
                self.model = None
                return False
        self.model = None
        return False

    def predict(self, features: FeatureSet) -> MLPrediction:
        if self.model is None:
            # Check if model has been saved since startup
            if not self.load_model():
                return MLPrediction(
                    is_available=False,
                    model_name=None,
                    model_version=None,
                    prediction_label=None,
                    confidence=None,
                    class_probabilities=None,
                    status_message="Supervised model artifact not configured or not found. Supervised classification is optional; rule-based reasoning and anomaly isolation remain active."
                )

        try:
            vec = features_to_vector(features)
            probs = self.model.predict_proba(vec)[0]
            classes = self.model_metadata.get("classes", ["Benign", "Suspicious"])
            
            # Map probabilities to classes
            class_probs = {classes[i]: round(float(probs[i]), 4) for i in range(min(len(classes), len(probs)))}
            predicted_idx = int(np.argmax(probs))
            predicted_label = classes[predicted_idx]
            confidence = float(probs[predicted_idx])
            
            return MLPrediction(
                is_available=True,
                model_name=self.model_metadata.get("name", "Random Forest Classifier"),
                model_version=self.model_metadata.get("version", "1.0.0"),
                prediction_label=predicted_label,
                confidence=round(confidence, 4),
                class_probabilities=class_probs,
                status_message="Supervised Random Forest classification executed successfully."
            )
        except Exception as e:
            return MLPrediction(
                is_available=False,
                model_name=None,
                model_version=None,
                prediction_label=None,
                confidence=None,
                class_probabilities=None,
                status_message=f"Model inference failed: {str(e)}"
            )

_model_manager = None

def get_model_manager() -> MLModelManager:
    global _model_manager
    if _model_manager is None:
        _model_manager = MLModelManager()
    return _model_manager
