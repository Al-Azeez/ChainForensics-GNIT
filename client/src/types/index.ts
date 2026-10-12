export interface NormalizedTransaction {
  hash: string;
  from_address: string;
  to_address: string | null;
  value_eth: number;
  timestamp: number;
  block_number?: number;
  gas_price_gwei?: number;
  gas_used?: number;
  is_error: boolean;
  method?: string;
  token_symbol?: string;
  token_value?: number;
}

export interface FeatureSet {
  tx_count: number;
  in_count: number;
  out_count: number;
  in_eth: number;
  out_eth: number;
  avg_value_eth: number;
  max_value_eth: number;
  std_value_eth: number;
  unique_counterparties: number;
  counterparty_entropy: number;
  tx_frequency_per_day: number;
  min_time_diff_sec: number;
  mean_time_diff_sec: number;
  rapid_onward_ratio: number;
  failed_tx_ratio: number;
  burst_score: number;
  net_flow_eth: number;
  feature_definitions: Record<string, string>;
}

export interface RuleResult {
  rule_id: string;
  rule_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  triggered: boolean;
  observed_value: any;
  threshold: any;
  explanation: string;
  supporting_txs: string[];
}

export interface AnomalyResult {
  is_anomaly: boolean;
  anomaly_score: number;
  confidence: number;
  method: string;
  explanation: string;
  baseline_description: string;
}

export interface MLPrediction {
  is_available: boolean;
  model_name?: string;
  model_version?: string;
  prediction_label?: string;
  confidence?: number;
  class_probabilities?: Record<string, number>;
  status_message: string;
}

export interface RiskAssessment {
  risk_score?: number;
  risk_classification: 'Insufficient Data' | 'No Major Anomaly Detected' | 'Unusual Activity' | 'Requires Further Review';
  confidence_score: number;
  evidence_summary: string[];
  limitations: string[];
  scoring_methodology: string;
  ruleset_version: string;
}

export interface GraphNode {
  data: {
    id: string;
    label: string;
    fullAddress: string;
    type: 'target_wallet' | 'target_tx' | 'counterparty';
    isTarget?: boolean;
    inflowEth?: number;
    outflowEth?: number;
    riskLevel?: string;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    valueEth: number;
    hash: string;
    timestamp: number;
    isError?: boolean;
  };
}

export interface Investigation {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  network: string;
  inputType: 'address' | 'transaction';
  inputIdentifier: string;
  isSampleData: boolean;
  analysisTimestamp: string | Date;
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
  featureSet: FeatureSet;
  ruleFindings: RuleResult[];
  anomalyFindings: AnomalyResult;
  mlFindings: MLPrediction;
  riskAssessment: RiskAssessment;
  rawTransactions: NormalizedTransaction[];
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  notes: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    backend: {
      status: string;
      uptimeSeconds: number;
      nodeVersion: string;
    };
    database: {
      status: string;
      connectionState: string;
      host: string;
    };
    aiEngine: {
      status: string;
      url: string;
      latencyMs: number;
      details?: any;
      error?: string;
    };
    ethereumRpc: {
      status: string;
      rpcUrl: string;
      blockNumber?: number;
      latencyMs: number;
      error?: string;
    };
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  targetAddress: string;
  description: string;
  expectedClassification: string;
  transactionCount: number;
}
