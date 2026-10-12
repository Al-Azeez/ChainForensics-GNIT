import axios from 'axios';
import { config } from '../config/index.js';
import { NormalizedTransaction } from './blockchain.service.js';

export interface AIAnalysisPayload {
  target_identifier: string;
  target_type: 'address' | 'transaction';
  transactions: NormalizedTransaction[];
  analysis_scope?: string;
  network?: string;
}

export interface AIAnalysisResponse {
  target_identifier: string;
  target_type: string;
  network: string;
  timestamp: number;
  data_completeness: string;
  record_count: number;
  features: Record<string, any>;
  rules: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    triggered: boolean;
    observed_value: any;
    threshold: any;
    explanation: string;
    supporting_txs: string[];
  }>;
  anomaly_detection: {
    is_anomaly: boolean;
    anomaly_score: number;
    confidence: number;
    method: string;
    explanation: string;
    baseline_description: string;
  };
  ml_prediction: {
    is_available: boolean;
    model_name?: string;
    model_version?: string;
    prediction_label?: string;
    confidence?: number;
    class_probabilities?: Record<string, number>;
    status_message: string;
  };
  risk_assessment: {
    risk_score?: number;
    risk_classification: string;
    confidence_score: number;
    evidence_summary: string[];
    limitations: string[];
    scoring_methodology: string;
    ruleset_version: string;
  };
}

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.aiServiceUrl;
  }

  public async checkHealth(): Promise<{ status: string; url: string; latencyMs: number; details?: any; error?: string }> {
    const start = Date.now();
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 3500 });
      return {
        status: 'healthy',
        url: this.baseUrl,
        latencyMs: Date.now() - start,
        details: response.data
      };
    } catch (e: any) {
      return {
        status: 'unreachable',
        url: this.baseUrl,
        latencyMs: Date.now() - start,
        error: e.message || 'AI service connection timeout'
      };
    }
  }

  public async runAnalysis(payload: AIAnalysisPayload): Promise<AIAnalysisResponse> {
    try {
      const response = await axios.post<AIAnalysisResponse>(`${this.baseUrl}/analyze`, payload, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`AI Analysis Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`AI Service is unreachable at ${this.baseUrl}. Please ensure the Python FastAPI engine is running.`);
    }
  }
}

export const aiService = new AIService();
