import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestigation extends Document {
  userId?: string;
  title: string;
  network: string;
  inputType: 'address' | 'transaction';
  inputIdentifier: string;
  isSampleData: boolean;
  analysisTimestamp: Date;
  dataSource: string;
  dataCompleteness: string;
  transactionSummary: {
    totalTx: number;
    inflowEth: number;
    outflowEth: number;
    uniqueCounterparties: number;
    timeSpanDays: number;
    failedTxCount: number;
  };
  featureSet: Record<string, any>;
  ruleFindings: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    triggered: boolean;
    observed_value: any;
    threshold: any;
    explanation: string;
    supporting_txs: string[];
  }>;
  anomalyFindings: {
    is_anomaly: boolean;
    anomaly_score: number;
    confidence: number;
    method: string;
    explanation: string;
    baseline_description: string;
  };
  mlFindings: {
    is_available: boolean;
    model_name?: string;
    model_version?: string;
    prediction_label?: string;
    confidence?: number;
    class_probabilities?: Record<string, number>;
    status_message: string;
  };
  riskAssessment: {
    risk_score?: number;
    risk_classification: string;
    confidence_score: number;
    evidence_summary: string[];
    limitations: string[];
    scoring_methodology: string;
    ruleset_version: string;
  };
  rawTransactions: Array<any>;
  graphData: {
    nodes: Array<{
      data: {
        id: string;
        label: string;
        type: string;
        isTarget?: boolean;
        inflowEth?: number;
        outflowEth?: number;
        riskLevel?: string;
      };
    }>;
    edges: Array<{
      data: {
        id: string;
        source: string;
        target: string;
        valueEth: number;
        hash: string;
        timestamp: number;
        isError?: boolean;
      };
    }>;
  };
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationSchema = new Schema<IInvestigation>(
  {
    userId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    network: { type: String, default: 'ethereum' },
    inputType: { type: String, enum: ['address', 'transaction'], required: true },
    inputIdentifier: { type: String, required: true, index: true },
    isSampleData: { type: Boolean, default: false, index: true },
    analysisTimestamp: { type: Date, default: Date.now },
    dataSource: { type: String, required: true },
    dataCompleteness: { type: String, required: true },
    transactionSummary: {
      totalTx: { type: Number, default: 0 },
      inflowEth: { type: Number, default: 0 },
      outflowEth: { type: Number, default: 0 },
      uniqueCounterparties: { type: Number, default: 0 },
      timeSpanDays: { type: Number, default: 0 },
      failedTxCount: { type: Number, default: 0 }
    },
    featureSet: { type: Schema.Types.Mixed, default: {} },
    ruleFindings: { type: [Schema.Types.Mixed], default: [] },
    anomalyFindings: { type: Schema.Types.Mixed, default: {} },
    mlFindings: { type: Schema.Types.Mixed, default: {} },
    riskAssessment: { type: Schema.Types.Mixed, required: true },
    rawTransactions: { type: [Schema.Types.Mixed], default: [] },
    graphData: {
      nodes: { type: [Schema.Types.Mixed], default: [] },
      edges: { type: [Schema.Types.Mixed], default: [] }
    },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Investigation = mongoose.model<IInvestigation>('Investigation', InvestigationSchema);
