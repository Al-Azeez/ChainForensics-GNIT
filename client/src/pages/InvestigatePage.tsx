import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { DemoScenario } from '../types';
import {
  Search,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Info,
  Server
} from 'lucide-react';

export const InvestigatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState(searchParams.get('q') || '');
  const [title, setTitle] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [analysisScope, setAnalysisScope] = useState('standard');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<string>('');
  const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ message: string; isRpcError?: boolean } | null>(null);

  const steps = [
    'Validating cryptographic identifier and checksum...',
    'Querying Ethereum JSON-RPC provider and receipt logs...',
    'Extracting 17-dimensional behavioral and temporal features...',
    'Evaluating forensic heuristic rules and pattern markers...',
    'Executing Isolation Forest multivariate anomaly isolation...',
    'Synthesizing evidence and archiving forensic dossier...'
  ];

  useEffect(() => {
    async function loadScenarios() {
      try {
        const list = await api.getDemoScenarios();
        setDemoScenarios(list);
      } catch {
        // Fallback
      }
    }
    loadScenarios();
  }, []);

  const validateInput = (input: string) => {
    const clean = input.trim();
    if (!clean) return 'Target identifier is required.';

    if (network === 'bitcoin') {
      if (/^(0x)?[a-fA-F0-9]{64}$/.test(clean)) return null;
      if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(clean) || /^(bc1)[a-zA-HJ-NP-Z0-9]{25,90}$/i.test(clean)) {
        return null;
      }
      return 'Bitcoin identifier must be a valid address (Legacy 1..., Script 3..., SegWit/Taproot bc1...) or 64-char transaction hash.';
    }

    if (!clean.startsWith('0x')) return 'EVM identifier must start with 0x.';
    if (clean.length === 42) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) return 'Invalid hexadecimal characters in address.';
      return null;
    }
    if (clean.length === 66) {
      if (!/^0x[a-fA-F0-9]{64}$/.test(clean)) return 'Invalid hexadecimal characters in transaction hash.';
      return null;
    }
    return 'Identifier must be either a 42-character wallet address or a 66-character transaction hash.';
  };

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    setValidationError(null);
    setApiError(null);
  };

  const handleClear = () => {
    setIdentifier('');
    setTitle('');
    setIsDemoMode(false);
    setSelectedDemoScenario('');
    setValidationError(null);
    setApiError(null);
  };

  const handleLoadScenario = (scenario: DemoScenario) => {
    setIsDemoMode(true);
    setSelectedDemoScenario(scenario.id);
    setIdentifier(scenario.targetAddress);
    setTitle(`[DEMO] ${scenario.name}`);
    setValidationError(null);
    setApiError(null);
  };

  const handleLoadRealExample = (addr: string, exampleTitle: string) => {
    setIsDemoMode(false);
    setSelectedDemoScenario('');
    setIdentifier(addr);
    setTitle(exampleTitle);
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate if not demo mode
    if (!isDemoMode) {
      const err = validateInput(identifier);
      if (err) {
        setValidationError(err);
        return;
      }
    }

    setIsSubmitting(true);
    setCurrentStepIndex(0);

    // Step progression animation
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const response = await api.analyze({
        identifier: identifier.trim(),
        title: title.trim() || undefined,
        network,
        analysisScope,
        demoMode: isDemoMode,
        demoScenarioId: selectedDemoScenario || undefined
      });

      clearInterval(interval);
      navigate(`/app/results/${response.investigationId}`);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      const msg = err.response?.data?.error || err.message || 'Analysis failed.';
      const isRpc = err.response?.data?.isRpcError || false;
      setApiError({ message: msg, isRpcError: isRpc });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
          <Shield className="w-4 h-4" />
          <span>FORENSIC WORKSPACE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
          Initiate New Investigation
        </h1>
        <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
          Input an Ethereum address or transaction hash. The analysis engine will retrieve on-chain records, compute behavioral feature vectors, execute heuristic rules, and isolate multivariate anomalies.
        </p>
      </div>

      {/* Mode Switcher Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B1730] border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDemoMode ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#2563EB]/20 text-[#06D9FF]'}`}>
            {isDemoMode ? <Play className="w-5 h-5 fill-current" /> : <Server className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">
              {isDemoMode ? 'Demonstration Mode Active (Deterministic Samples)' : 'Live Blockchain Investigation Mode'}
            </h4>
            <p className="text-[11px] text-[#94A3B8]">
              {isDemoMode
                ? 'Using verified deterministic benchmark cases. Records are clearly labeled as SAMPLE DATA.'
                : 'Direct JSON-RPC connection to live Ethereum mainnet.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsDemoMode(!isDemoMode);
            setSelectedDemoScenario('');
            setApiError(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isDemoMode
              ? 'bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]'
              : 'bg-[#06132D] border-white/10 text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          {isDemoMode ? 'Switch to Live RPC' : 'Switch to Demo Mode'}
        </button>
      </div>

      {/* Main Investigation Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0B1730] border border-[#06D9FF]/20 shadow-card space-y-6">
        {/* Identifier Field */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-[#F8FAFC]">
            <span>Target Identifier (Wallet Address or Transaction Hash) *</span>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              {network === 'bitcoin' ? 'BTC Address (1..., 3..., bc1...) or 64-char Hash' : '0x... (42 or 66 chars)'}
            </span>
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#06D9FF]" />
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder={network === 'bitcoin' ? 'e.g. 34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo or 9e4f03529d...' : 'e.g. 0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8 or 0x5c504ed432...'}
              value={identifier}
              onChange={e => handleIdentifierChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06132D] border text-xs text-[#F8FAFC] font-mono placeholder-[#94A3B8]/50 focus:outline-none transition-colors ${
                validationError
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-white/10 focus:border-[#06D9FF]'
              }`}
            />
          </div>
          {validationError && (
            <p className="text-xs text-[#EF4444] flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationError}
            </p>
          )}
          <p className="text-[11px] text-[#94A3B8] leading-tight">
            * Valid address format verifies cryptographic syntax; it does not guarantee prior transaction history on the network.
          </p>
        </div>

        {/* Optional Title & Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#F8FAFC]">
              Investigation Case Title (Optional)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              placeholder="e.g. Operation Layering Audit 2026"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06D9FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#F8FAFC]">
              Blockchain Network
            </label>
            <select
              value={network}
              disabled={isSubmitting}
              onChange={e => setNetwork(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum Mainnet (ETH)</option>
              <option value="polygon">Polygon PoS (MATIC / POL)</option>
              <option value="bsc">BNB Smart Chain (BNB / BEP-20)</option>
            </select>
          </div>
        </div>

        {/* Quick Fill Real Wallet Suggestions */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <label className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Quick-Fill Verified Addresses & Networks
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Binance Cold Storage (BTC)', addr: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', net: 'bitcoin', desc: 'Reserve Custody Vault' },
              { label: 'Satoshi Genesis (BTC)', addr: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', net: 'bitcoin', desc: 'Block 0 Historical Genesis' },
              { label: 'Binance Hot 14 (ETH)', addr: '0x28C6c06298d514Db089934071355E5743bf21d60', net: 'ethereum', desc: 'High Volume CEX Node' },
              { label: 'Polygon Bridge (Polygon)', addr: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf', net: 'polygon', desc: 'Polygon Core Bridge' },
              { label: 'Binance Hot Wallet (BSC)', addr: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', net: 'bsc', desc: 'BSC Sweep Hub' }
            ].map(ex => (
              <button
                key={ex.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setNetwork(ex.net);
                  handleLoadRealExample(ex.addr, `Audit: ${ex.label}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#06132D] hover:bg-[#152a54] border border-white/10 hover:border-[#06D9FF]/40 text-[11px] font-mono text-[#94A3B8] hover:text-[#06D9FF] transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Scope */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F8FAFC]">Analysis Scope</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'standard', label: 'Standard Forensic Audit', desc: 'Analyzes available window & heuristics' },
              { id: 'deep', label: 'Deep Graph Exploration', desc: 'Extended multi-hop counterparty trace' },
              { id: 'single_tx', label: 'Single Transaction Telemetry', desc: 'Targeted single receipt analysis' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => setAnalysisScope(s.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  analysisScope === s.id
                    ? 'bg-[#2563EB]/20 border-[#06D9FF]/50 text-[#F8FAFC] shadow-glow-cyan'
                    : 'bg-[#06132D] border-white/5 text-[#94A3B8] hover:border-white/20'
                }`}
              >
                <span className="block text-xs font-bold text-[#F8FAFC]">{s.label}</span>
                <span className="block text-[10px] text-[#94A3B8] mt-1">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Error Box with Prompt for Demo Mode */}
        {apiError && (
          <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#EF4444] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Investigation Error</span>
            </div>
            <p className="text-[#F8FAFC]">{apiError.message}</p>
            {apiError.isRpcError && (
              <div className="pt-2 border-t border-[#EF4444]/20 flex items-center justify-between">
                <span className="text-[#94A3B8] text-[11px]">
                  Would you like to explore this analysis in Demonstration Mode instead?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoMode(true);
                    if (demoScenarios[0]) handleLoadScenario(demoScenarios[0]);
                  }}
                  className="px-3 py-1 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded text-[11px] font-semibold"
                >
                  Load Demo Case
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress Stepper Animation when Submitting */}
        {isSubmitting && (
          <div className="p-4 rounded-xl bg-[#06132D] border border-[#06D9FF]/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
              <div className="w-3 h-3 border-2 border-[#06D9FF] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Blockchain Records...</span>
            </div>
            <div className="space-y-1.5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs transition-opacity ${
                    idx === currentStepIndex
                      ? 'text-[#06D9FF] font-semibold'
                      : idx < currentStepIndex
                      ? 'text-[#22C55E]'
                      : 'text-[#94A3B8]/30'
                  }`}
                >
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px] shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#06132D] hover:bg-[#102246] border border-white/10 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06D9FF] text-white font-bold text-xs shadow-glow-blue hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isSubmitting ? 'Analyzing...' : 'Analyze Transaction Evidence'}</span>
          </button>
        </div>
      </form>

      {/* Benchmark Case Loaders Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-sm font-bold text-[#F8FAFC]">
            Deterministic Benchmark Scenarios & Wallets (5 Pre-Calibrated Profiles)
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Explore pre-calibrated forensic scenarios and realistic wallet topology patterns without requiring an external blockchain API key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoScenarios.map(s => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-3 flex flex-col justify-between hover:border-[#06D9FF]/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-mono font-semibold border border-[#F59E0B]/30">
                    {s.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {s.transactionCount || 0} Tx
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F8FAFC]">{s.name}</h4>
                <div className="text-[10px] font-mono text-[#06D9FF] truncate">
                  {s.targetAddress}
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  {s.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#F8FAFC]">
                  {s.expectedClassification}
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadScenario(s)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#2563EB]/20 hover:bg-[#2563EB] text-[#06D9FF] hover:text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Load Case</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
