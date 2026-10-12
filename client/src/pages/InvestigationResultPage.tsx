import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation } from '../types';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { TransactionTable } from '../components/TransactionTable';
import { RuleFindingsCard } from '../components/RuleFindingsCard';
import { AnomalyCard } from '../components/AnomalyCard';
import { MLPredictionCard } from '../components/MLPredictionCard';
import { ExportReportModal } from '../components/ExportReportModal';
import {
  Shield,
  Layers,
  Share2,
  List,
  Activity,
  Cpu,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Save,
  Tag,
  Clock,
  Database
} from 'lucide-react';

export const InvestigationResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'transactions' | 'features' | 'rules' | 'notes'>('overview');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Notes & Tags Editing State
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);

  useEffect(() => {
    async function fetchInvestigation() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.getInvestigationById(id);
        setInvestigation(data);
        setNotes(data.notes || '');
        setTagsInput((data.tags || []).join(', '));
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load investigation record.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvestigation();
  }, [id]);

  const handleCopyIdentifier = () => {
    if (!investigation) return;
    navigator.clipboard.writeText(investigation.inputIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = async () => {
    if (!investigation || !id) return;
    setIsSavingNotes(true);
    try {
      const tagsArray = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const updated = await api.updateInvestigation(id, {
        notes,
        tags: tagsArray
      });
      setInvestigation(updated);
      setNotesSavedAlert(true);
      setTimeout(() => setNotesSavedAlert(false), 3000);
    } catch {
      // Save error
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#06D9FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#94A3B8]">Loading Forensic Investigation Dossier...</p>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="p-8 max-w-2xl mx-auto rounded-2xl bg-[#0B1730] border border-[#EF4444]/40 space-y-4 text-center">
        <AlertTriangle className="w-10 h-10 text-[#EF4444] mx-auto" />
        <h2 className="text-lg font-bold text-[#F8FAFC]">Investigation Not Found</h2>
        <p className="text-xs text-[#94A3B8]">{error || 'Unable to retrieve dossier records.'}</p>
        <Link
          to="/app/investigate"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start New Investigation</span>
        </Link>
      </div>
    );
  }

  const { riskAssessment, transactionSummary, featureSet, ruleFindings, anomalyFindings, mlFindings, graphData, rawTransactions } = investigation;
  const currency = (investigation.network || '').toLowerCase().trim() === 'bitcoin'
    ? 'BTC'
    : (investigation.network || '').toLowerCase().trim() === 'bsc'
      ? 'BNB'
      : (investigation.network || '').toLowerCase().trim() === 'polygon'
        ? 'POL'
        : 'ETH';

  const explorerUrl = (investigation.network || '').toLowerCase().trim() === 'bitcoin'
    ? (investigation.inputType === 'transaction'
        ? `https://mempool.space/tx/${investigation.inputIdentifier.replace(/^0x/, '')}`
        : `https://mempool.space/address/${investigation.inputIdentifier}`)
    : (investigation.network || '').toLowerCase().trim() === 'polygon'
      ? (investigation.inputType === 'transaction'
          ? `https://polygonscan.com/tx/${investigation.inputIdentifier}`
          : `https://polygonscan.com/address/${investigation.inputIdentifier}`)
      : (investigation.network || '').toLowerCase().trim() === 'bsc'
        ? (investigation.inputType === 'transaction'
            ? `https://bscscan.com/tx/${investigation.inputIdentifier}`
            : `https://bscscan.com/address/${investigation.inputIdentifier}`)
        : (investigation.inputType === 'transaction'
            ? `https://etherscan.io/tx/${investigation.inputIdentifier}`
            : `https://etherscan.io/address/${investigation.inputIdentifier}`);

  return (
    <div className="space-y-6 pb-20">
      {/* Back button & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/app/history"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-[#06D9FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigation Archive</span>
        </Link>

        <div className="flex items-center gap-2">
          {investigation.isSampleData && (
            <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-bold font-mono">
              SAMPLE BENCHMARK DATA
            </span>
          )}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-glow-blue transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export Executive Dossier</span>
          </button>
        </div>
      </div>

      {/* Hero Summary Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#06132D] via-[#0B1730] to-[#06132D] border border-[#06D9FF]/30 shadow-card grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Column: Identifiers & Metadata */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#06D9FF]">
              <Shield className="w-3.5 h-3.5" />
              <span>FORENSIC CASE ID: {investigation._id || investigation.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              {investigation.title}
            </h1>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#020817] p-2.5 rounded-xl border border-white/10 max-w-xl">
              <span className="text-[#94A3B8] uppercase text-[10px]">Target:</span>
              <span className="text-[#06D9FF] font-semibold truncate flex-1 select-all">
                {investigation.inputIdentifier}
              </span>
              <button
                onClick={handleCopyIdentifier}
                className="p-1 text-[#94A3B8] hover:text-[#06D9FF]"
                title="Copy Identifier"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-[#94A3B8] hover:text-[#06D9FF]"
                title="View on Block Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-[#94A3B8] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#06D9FF]" />
                {new Date(investigation.analysisTimestamp).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                {investigation.dataSource}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                Completeness: {investigation.dataCompleteness}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Radial Risk Gauge */}
        <div className="flex justify-center lg:justify-end">
          <RiskScoreBadge
            score={riskAssessment.risk_score}
            classification={riskAssessment.risk_classification}
            confidence={riskAssessment.confidence_score}
            showGauge={true}
          />
        </div>
      </div>

      {/* Metrics Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] text-[#94A3B8] uppercase">Observed Transfers</span>
          <span className="text-xl font-bold text-[#F8FAFC] block">{transactionSummary.totalTx}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] text-[#94A3B8] uppercase">Inflow Volume</span>
          <span className="text-xl font-bold text-[#22C55E] block">{transactionSummary.inflowEth} {currency}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] text-[#94A3B8] uppercase">Outflow Volume</span>
          <span className="text-xl font-bold text-[#EF4444] block">{transactionSummary.outflowEth} {currency}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] text-[#94A3B8] uppercase">Unique Counterparties</span>
          <span className="text-xl font-bold text-[#06D9FF] block">{transactionSummary.uniqueCounterparties}</span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Evidence & Findings', icon: Shield },
          { id: 'network', label: 'Wallet Network Graph', icon: Share2 },
          { id: 'transactions', label: `Transactions (${rawTransactions.length})`, icon: List },
          { id: 'features', label: 'Feature Telemetry (17)', icon: Activity },
          { id: 'rules', label: 'Rule Engine & ML', icon: Cpu },
          { id: 'notes', label: 'Case Notes & Tags', icon: Edit3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2563EB]/25 text-[#06D9FF] border border-[#06D9FF]/40 shadow-glow-cyan'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Evidence */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Findings List */}
          <div className="p-6 rounded-xl bg-[#0B1730] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#06D9FF]" />
              <span>Evidence-Backed Findings</span>
            </h3>
            <div className="space-y-2.5">
              {riskAssessment.evidence_summary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#06132D] border border-white/5 text-xs text-[#F8FAFC] leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06D9FF] shrink-0 mt-2" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side: Anomaly Isolation & ML Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnomalyCard anomaly={anomalyFindings} />
            <MLPredictionCard ml={mlFindings} />
          </div>

          {/* Limitations and Methodology */}
          <div className="p-6 rounded-xl bg-[#0B1730] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B]">
              <AlertTriangle className="w-4 h-4" />
              <span>Investigation Limitations & Analytical Context</span>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-xs text-[#94A3B8]">
              {riskAssessment.limitations.map((lim, idx) => (
                <li key={idx} className="leading-relaxed">{lim}</li>
              ))}
            </ul>
            <div className="p-3 rounded-lg bg-[#06132D] border border-white/5 text-[11px] font-mono text-[#94A3B8]">
              <strong>Methodology:</strong> {riskAssessment.scoring_methodology} (Ruleset: {riskAssessment.ruleset_version})
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Network Graph */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Multi-Hop Fund Flow Visualizer</h3>
              <p className="text-xs text-[#94A3B8]">
                Interactive directional graph mapping source and destination fund movements
              </p>
            </div>
          </div>
          <CytoscapeGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            targetIdentifier={investigation.inputIdentifier}
            height="550px"
          />
        </div>
      )}

      {/* Tab 3: Transaction Table */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <TransactionTable
            transactions={rawTransactions}
            targetAddress={investigation.inputIdentifier}
            network={investigation.network}
          />
        </div>
      )}

      {/* Tab 4: Feature Telemetry */}
      {activeTab === 'features' && (
        <div className="p-6 rounded-xl bg-[#0B1730] border border-white/10 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">17-Dimensional Behavioral Feature Vector</h3>
            <p className="text-xs text-[#94A3B8]">
              Computed metrics feeding into the Isolation Forest anomaly detector and rule engine
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(featureSet || {})
              .filter(([key]) => key !== 'feature_definitions')
              .map(([key, value]) => {
                const desc = featureSet?.feature_definitions?.[key] || '';
                return (
                  <div key={key} className="p-4 rounded-xl bg-[#06132D] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#06D9FF] uppercase">{key}</span>
                    <span className="text-lg font-bold font-mono text-[#F8FAFC] block">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                    <p className="text-[10px] text-[#94A3B8] leading-tight pt-1">{desc}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 5: Rule Engine */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <RuleFindingsCard rules={ruleFindings} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnomalyCard anomaly={anomalyFindings} />
            <MLPredictionCard ml={mlFindings} />
          </div>
        </div>
      )}

      {/* Tab 6: Notes & Tags */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-xl bg-[#0B1730] border border-white/10 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Forensic Case Notes & Tagging</h3>
            <p className="text-xs text-[#94A3B8]">
              Attach analytical findings, investigator annotations, and custom categorization tags.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span>Case Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Layering, High-Risk, Hackathon-Case-A, Exchange Sweep"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Investigator Notes & Chain of Custody Annotations</span>
              </label>
              <textarea
                rows={6}
                placeholder="Add notes, hypothesis, interview observations, or subpoenas references..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {notesSavedAlert && (
                <span className="text-xs text-[#22C55E] flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Notes & Tags Saved Successfully
                </span>
              )}
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs transition-all shadow-glow-blue"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Case Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        investigation={investigation}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
