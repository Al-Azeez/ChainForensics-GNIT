import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Share2,
  Activity,
  Cpu,
  FileText,
  Shield,
  ArrowRight,
  Database,
  Layers,
  Terminal,
  CheckCircle,
  Play,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated background network nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = 28;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulse: number;
    }> = [];

    const colors = ['#06D9FF', '#2563EB', '#7C3AED'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 3 + 2,
        color: colors[i % colors.length],
        pulse: Math.random() * Math.PI
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = 1 - dist / 140;
            ctx.strokeStyle = `rgba(6, 217, 255, ${alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes & pulses
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Glow ring
        const glowRadius = node.radius + Math.sin(node.pulse) * 4 + 2;
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.1, glowRadius), 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleDemoAccess = async () => {
    await demoLogin();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#020817] text-[#F8FAFC] flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Canvas Network */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#2563EB]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06132D] border border-[#06D9FF]/30 text-xs font-mono text-[#06D9FF] shadow-glow-cyan">
            <span className="w-2 h-2 rounded-full bg-[#06D9FF] animate-ping" />
            <span>AI-Powered Blockchain Intelligence & Forensics</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Every Transaction{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06D9FF] via-[#2563EB] to-[#7C3AED]">
              Leaves a Trail.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            Investigate blockchain activity, trace wallet relationships, and uncover unusual transaction patterns with explainable AI-powered analytics.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/app/investigate"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06D9FF] text-white font-semibold text-sm shadow-glow-blue hover:brightness-110 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemoAccess}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1730] hover:bg-[#102246] border border-[#06D9FF]/30 text-[#F8FAFC] font-semibold text-sm transition-all shadow-card"
            >
              <Play className="w-4 h-4 text-[#06D9FF] fill-current" />
              <span>Explore Benchmark Demos</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#0B1730]/70 border border-white/5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Target Scope</span>
              <span className="block text-lg font-bold text-[#06D9FF]">Ethereum + EVM</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0B1730]/70 border border-white/5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Detection Logic</span>
              <span className="block text-lg font-bold text-[#F8FAFC]">6 Rule Heuristics</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0B1730]/70 border border-white/5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Anomaly Engine</span>
              <span className="block text-lg font-bold text-[#7C3AED]">Isolation Forest</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0B1730]/70 border border-white/5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase">ML Classifier</span>
              <span className="block text-lg font-bold text-[#22C55E]">Random Forest</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Overview Section */}
      <section className="py-20 bg-[#06132D]/60 border-y border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#06D9FF]">
              Comprehensive Forensic Suite
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Built for Serious Blockchain Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#2563EB]/20 border border-[#06D9FF]/30 text-[#06D9FF] w-fit">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Blockchain Transaction Analysis
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Retrieve and normalize live Ethereum blockchain records via JSON-RPC. Distinguish native ETH from contract interactions, compute gas metrics, and analyze execution status.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] w-fit">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                AI Anomaly Detection
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Multivariate Isolation Forest model isolates behavioral outliers based on velocity, temporal intervals, entropy, and burst metrics without forcing biased assumptions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#06D9FF]/20 border border-[#06D9FF]/30 text-[#06D9FF] w-fit">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Interactive Network Graphs
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                High-performance Cytoscape.js visual graph engine maps wallet relationships, transfer directions, fund amounts, and neighborhood clustering in real time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] w-fit">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Explainable Risk Assessment
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Every score is backed by specific triggered rules, documented threshold markers, and concrete transaction references—never a mysterious black box.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/30 text-[#2563EB] w-fit">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Investigation Case History
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Persist investigative dossiers with MongoDB Atlas or seamless in-memory fallback. Search, filter, tag, and add forensic case notes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4 hover:border-[#06D9FF]/40 transition-colors">
              <div className="p-3 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Evidence-Based Reports
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Export formal investigative briefs in printable PDF or Markdown formats, complete with data limitations, methodology, and legal disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#06D9FF]">
              Methodology
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              The 5-Stage Investigation Pipeline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Collect Data', desc: 'Query RPC provider or benchmark datasets' },
              { step: '02', title: 'Extract Features', desc: 'Calculate 17 behavioral & topological dimensions' },
              { step: '03', title: 'Evaluate Rules', desc: 'Check 6 heuristics & Isolation Forest density' },
              { step: '04', title: 'Synthesize Evidence', desc: 'Generate explainable risk classification' },
              { step: '05', title: 'Export Dossier', desc: 'Archive findings & generate executive brief' }
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-2 relative">
                <span className="font-mono text-2xl font-black text-[#06D9FF]/40">{s.step}</span>
                <h4 className="font-bold text-sm text-[#F8FAFC]">{s.title}</h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Showcase */}
      <section className="py-16 bg-[#06132D] border-t border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Built with Robust Production Architecture
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="px-4 py-2 rounded-xl bg-[#0B1730] border border-white/10 font-mono text-xs flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#06D9FF]" /> Python FastAPI (Port 8000)
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#0B1730] border border-white/10 font-mono text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2563EB]" /> Node / Express (Port 4321)
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#0B1730] border border-white/10 font-mono text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C3AED]" /> React + Vite (Port 3210)
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#0B1730] border border-white/10 font-mono text-xs flex items-center gap-2">
              <Database className="w-4 h-4 text-[#22C55E]" /> MongoDB Atlas
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
