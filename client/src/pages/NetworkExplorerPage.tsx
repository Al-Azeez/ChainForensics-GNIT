import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Investigation, GraphNode, GraphEdge } from '../types';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { Share2, Search, Filter, Layers, Info, Play, ExternalLink } from 'lucide-react';

export const NetworkExplorerPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCases() {
      setIsLoading(true);
      try {
        const res = await api.getInvestigations({ limit: 50 });
        const list = res.investigations || [];
        setInvestigations(list);
        if (list.length > 0) {
          setSelectedCaseId(list[0]._id || list[0].id || '');
          setActiveInvestigation(list[0]);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadCases();
  }, []);

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const found = investigations.find(inv => (inv._id || inv.id) === id);
    if (found) setActiveInvestigation(found);
  };

  const handleLoadDemoCase = async () => {
    try {
      const res = await api.analyze({
        identifier: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        demoMode: true,
        demoScenarioId: 'layering_peeling'
      });
      setActiveInvestigation(res.investigation);
      setInvestigations(prev => [res.investigation, ...prev]);
      setSelectedCaseId(res.investigationId);
    } catch {
      // Demo load failed
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
            <Share2 className="w-4 h-4" />
            <span>GRAPH INTELLIGENCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Multi-Hop Wallet & Fund Tracing Workspace
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Explore cryptographic transfer topologies, analyze counterparty clustering, and trace fund flows.
          </p>
        </div>

        {/* Case selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {investigations.length > 0 ? (
            <select
              value={selectedCaseId}
              onChange={e => handleSelectCase(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#0B1730] border border-[#06D9FF]/30 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
            >
              {investigations.map(inv => (
                <option key={inv._id || inv.id} value={inv._id || inv.id}>
                  {inv.title} ({inv.inputIdentifier.slice(0, 8)}...)
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={handleLoadDemoCase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow-glow-blue"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Sample Graph Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas */}
      {activeInvestigation && activeInvestigation.graphData ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#94A3B8]">Target:</span>
              <span className="text-[#06D9FF] font-bold">{activeInvestigation.inputIdentifier}</span>
            </div>
            <div className="flex items-center gap-4 text-[#94A3B8] font-mono text-[11px]">
              <span>Nodes: <strong className="text-[#F8FAFC]">{activeInvestigation.graphData.nodes?.length || 0}</strong></span>
              <span>Transfers: <strong className="text-[#F8FAFC]">{activeInvestigation.graphData.edges?.length || 0}</strong></span>
              <span>Total Inflow: <strong className="text-[#22C55E]">{activeInvestigation.transactionSummary.inflowEth} ETH</strong></span>
              <span>Total Outflow: <strong className="text-[#EF4444]">{activeInvestigation.transactionSummary.outflowEth} ETH</strong></span>
            </div>
          </div>

          <CytoscapeGraph
            nodes={activeInvestigation.graphData.nodes}
            edges={activeInvestigation.graphData.edges}
            targetIdentifier={activeInvestigation.inputIdentifier}
            height="620px"
          />
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0B1730] border border-dashed border-white/10 text-center space-y-4">
          <Share2 className="w-12 h-12 text-[#94A3B8]/30 mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">No Graph Data Available</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Launch an investigation on an address or transaction to generate an interactive fund flow network.
          </p>
          <button
            onClick={handleLoadDemoCase}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow-glow-blue"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Load Benchmark Layering Case</span>
          </button>
        </div>
      )}
    </div>
  );
};
