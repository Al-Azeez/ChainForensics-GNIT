import React from 'react';
import { MLPrediction } from '../types';
import { Cpu, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface MLPredictionCardProps {
  ml: MLPrediction;
}

export const MLPredictionCard: React.FC<MLPredictionCardProps> = ({ ml }) => {
  if (!ml.is_available) {
    return (
      <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#94A3B8]" />
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Supervised ML Classifier</h3>
            <p className="text-[11px] text-[#94A3B8]">
              Random Forest Ensemble Prediction
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#06132D] border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">Model Artifact Status</span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            {ml.status_message}
          </p>
          <div className="text-[11px] font-mono text-[#06D9FF] bg-[#0B1730] p-2 rounded border border-white/5">
            Command to train: <code className="text-[#F8FAFC]">python training/train_model.py</code>
          </div>
        </div>
      </div>
    );
  }

  const isSuspicious = ml.prediction_label?.includes('Suspicious') || ml.prediction_label?.includes('High Risk');

  return (
    <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#06D9FF]" />
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Supervised Random Forest Classifier</h3>
            <p className="text-[11px] text-[#94A3B8]">
              {ml.model_name} (v{ml.model_version || '1.0'})
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isSuspicious
              ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
              : 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
          }`}
        >
          {ml.prediction_label}
        </span>
      </div>

      <div className="bg-[#06132D] p-3.5 rounded-lg border border-white/5 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-[#94A3B8]">Classification Confidence:</span>
          <span className="font-bold text-[#F8FAFC]">
            {ml.confidence ? `${(ml.confidence * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>

        {ml.class_probabilities && (
          <div className="space-y-2 pt-1 border-t border-white/5">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
              Class Probability Distribution
            </span>
            {Object.entries(ml.class_probabilities).map(([cls, prob]) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">{cls}</span>
                  <span className="text-[#F8FAFC]">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#0B1730] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cls.includes('Suspicious') ? 'bg-[#EF4444]' : 'bg-[#22C55E]'
                    }`}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#94A3B8] leading-relaxed">
        {ml.status_message}
      </p>
    </div>
  );
};
