import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Investigation } from '../types';
import { ExportReportModal } from '../components/ExportReportModal';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import {
  FileText,
  Printer,
  Download,
  Search,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const res = await api.getInvestigations({ limit: 50 });
        setInvestigations(res.investigations || []);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleOpenReport = (inv: Investigation) => {
    setSelectedInvestigation(inv);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
          <FileText className="w-4 h-4" />
          <span>DOSSIER REPOSITORY</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
          Executive Forensic Reports & Briefings
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Review and export evidence-backed forensic dossiers with methodology notes and chain-of-custody timestamps.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {investigations.length > 0 ? (
          investigations.map(inv => (
            <div
              key={inv._id || inv.id}
              className="p-5 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 flex flex-col justify-between hover:border-[#06D9FF]/40 transition-colors shadow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <RiskScoreBadge
                    score={inv.riskAssessment?.risk_score}
                    classification={inv.riskAssessment?.risk_classification}
                    size="sm"
                  />
                  <span className="text-[10px] font-mono text-[#94A3B8] text-right" title={new Date(inv.analysisTimestamp).toISOString()}>
                    {new Date(inv.analysisTimestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                    <span className="text-[#06D9FF]/80">
                      {new Date(inv.analysisTimestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] line-clamp-1">{inv.title}</h3>
                  <span className="text-[10px] font-mono text-[#06D9FF] truncate block">
                    {inv.inputIdentifier}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {inv.riskAssessment?.evidence_summary?.[0] || 'No summary notes available.'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#94A3B8]">
                  {inv.transactionSummary?.totalTx || 0} Transfers
                </span>
                <button
                  onClick={() => handleOpenReport(inv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB] text-[#06D9FF] hover:text-white text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Dossier</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-[#94A3B8] bg-[#0B1730] rounded-2xl border border-dashed border-white/10 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[#94A3B8]/30" />
            <p>No investigation dossiers available to export yet.</p>
          </div>
        )}
      </div>

      {selectedInvestigation && (
        <ExportReportModal
          investigation={selectedInvestigation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
