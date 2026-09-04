import React, { useState } from 'react';
import { AntigravityLogo } from './AntigravityLogo';
import { Layers, BookOpen, Network, ShieldCheck, ArrowRight, Cpu, ChevronRight, Activity, Search, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SAMPLE_QUERIES } from '../data/mockData';
import type { SampleQuery } from '../types';
import { FileUploadTrigger, FileChipsList, type UploadedFile } from './FileUploadButton';

interface LandingHeroProps {
  onStartQuery: (queryText: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartQuery, onNavigateTab }) => {
  const [heroInput, setHeroInput] = useState('');
  const [heroFiles, setHeroFiles] = useState<UploadedFile[]>([]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = heroInput.trim() || heroFiles.length > 0;
    if (!hasContent) return;
    const queryWithFiles = heroFiles.length > 0
      ? `${heroInput.trim()} [Attached: ${heroFiles.map(f => f.name).join(', ')}]`
      : heroInput.trim();
    onStartQuery(queryWithFiles);
    onNavigateTab('assistant');
  };

  const handleFilesSelect = (newFiles: UploadedFile[]) => {
    setHeroFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (id: string) => {
    setHeroFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12 pt-4">
      {/* Hero Section — Light Theme IP-SAKTI Sahayak */}
      <div className="relative rounded-3xl p-8 md:p-12 antigravity-glass border border-slate-200/80 overflow-hidden text-center space-y-6 google-shimmer-border">
        {/* Google Pastel Glow Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Levitating Announcement Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-mono font-semibold text-slate-800 backdrop-blur-xl animate-levitate-slow shadow-xs">
          <AntigravityLogo size={20} />
          <span>Smart India Hackathon • SIH 26045 Multi-Agent RAG Harness</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-slate-950 leading-tight max-w-4xl mx-auto">
          Protect your <span className="google-shimmer-text">AYUSH Innovation</span> before someone else patents it
        </h1>

        <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto font-sans font-medium leading-relaxed">
          Traditional formulations are being patented abroad while Indian innovators remain unprotected. IP-SAKTI Sahayak runs a 4-agent autonomous audit — grounding every claim in the Patents Act 1970/2024, Biological Diversity Act 2023, TKDL corpora, and WIPO GRATK 2024 — in seconds.
        </p>

        {/* Perfectly Aligned Search Capsule with 100% Full-Width Input */}
        <div className="pt-2 max-w-3xl mx-auto">
          <form
            onSubmit={handleHeroSubmit}
            className="bg-white rounded-3xl border border-slate-300 shadow-xl google-shimmer-border transition-all focus-within:ring-2 focus-within:ring-slate-950 overflow-hidden text-left"
          >
            {/* File chips row — shown above input when attached */}
            {heroFiles.length > 0 && (
              <div className="px-5 pt-3 pb-1 border-b border-slate-100 bg-slate-50/60">
                <FileChipsList files={heroFiles} onRemove={handleFileRemove} />
              </div>
            )}

            {/* Main input row */}
            <div className="flex items-center gap-3 p-2.5 pl-5 pr-2.5 min-h-[58px]">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />

              <input
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder="Describe formulation, or attach a PDF / PPT / image..."
                className="flex-1 min-w-0 bg-transparent text-slate-950 font-medium text-sm sm:text-base focus:outline-none placeholder:text-slate-400 py-1.5 relative z-10"
              />

              {/* Upload trigger button (paperclip) */}
              <FileUploadTrigger onFilesSelect={handleFilesSelect} />

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Audit Formulation</span>
              </button>
            </div>
          </form>

          {/* Quick Real-Time Metrics & Live Capability Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-left flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">100% Statutory Grounding</strong>
                <span className="text-[10px] text-slate-500 font-medium">Patents Act & TKDL Corpora</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-left flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">4-Subagent Pipeline</strong>
                <span className="text-[10px] text-slate-500 font-medium">Parallel Legal Audit</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-left flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">Sec 3(p) Prior-Art Bar</strong>
                <span className="text-[10px] text-slate-500 font-medium">Novelty & Synergy Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Suite — Light Theme Bento Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-950" />
              Explore our next generation products
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Built for developers, legal officers, and researchers in the agent-first era.
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab('architecture')}
            className="text-xs font-mono font-bold text-slate-950 hover:underline flex items-center gap-1"
          >
            <span>See overview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="p-6 rounded-3xl bg-white border border-slate-200 cursor-pointer group flex flex-col justify-between hover:border-slate-400 transition-all shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                Product Classifier
              </span>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-slate-800 transition-colors mt-1">
                AYUSH Classification Wizard
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Diagnostic wizard categorizing products into SLA, CDSCO, or FSSAI regulatory pathways.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between font-bold">
              <span>Classifier Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="p-6 rounded-3xl bg-white border border-slate-200 cursor-pointer group flex flex-col justify-between hover:border-slate-400 transition-all shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                TKDL Radar
              </span>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-slate-800 transition-colors mt-1">
                Traditional Knowledge Radar
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Sanskrit ↔ Botanical ↔ Bioactive term mapping to evaluate Section 3(p) prior art bars.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between font-bold">
              <span>Sanskrit Corpora</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="p-6 rounded-3xl bg-white border border-slate-200 cursor-pointer group flex flex-col justify-between hover:border-slate-400 transition-all shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                ABS Checker
              </span>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-slate-800 transition-colors mt-1">
                Biodiversity ABS Duty
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Enforces NBA Section 6 pre-approval & Kani-Arogyapacha indigenous benefit-sharing.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between font-bold">
              <span>BD Act 2023</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="p-6 rounded-3xl bg-white border border-slate-200 cursor-pointer group flex flex-col justify-between hover:border-slate-400 transition-all shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Network className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                What-If Simulator
              </span>
              <h3 className="text-base font-bold text-slate-950 group-hover:text-slate-800 transition-colors mt-1">
                Interactive Product Simulator
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Live recalculation of patent readiness as ingredients & extraction methods change.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between font-bold">
              <span>Recalculation Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Section */}
      <div className="rounded-3xl bg-white p-8 border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-display">
              Launch Pre-Built Validation Scenarios
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Click any scenario to trigger the autonomous multi-agent audit loop.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-950 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-bold">
            Audited Scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_QUERIES.map((sq: SampleQuery) => (
            <button
              key={sq.id}
              onClick={() => {
                onStartQuery(sq.query);
                onNavigateTab('assistant');
              }}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all group flex items-start justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <span className="text-xs font-bold text-slate-950 group-hover:text-slate-800 block">
                  {sq.title}
                </span>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{sq.query}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 shrink-0 ml-3 mt-1 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
