import React from 'react';
import { Cpu, ArrowDown } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold font-display text-white">
                IP-SAKTI Sahayak — 5-Layer Architectural Blueprint
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete technical topology illustrating how multi-agent audit loops and legal Graph RAG produce 100% auditable decisions.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-mono text-xs border border-purple-500/30 font-bold">
            System Topology v2.4
          </span>
        </div>

        {/* 5-Layer Flow */}
        <div className="space-y-4">
          {/* Layer 5 */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Layer 5: Interactive Application Suite
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                User Interface
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-200">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-center font-semibold">
                RAG Assistant
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-center font-semibold">
                Product Classifier
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-center font-semibold">
                TKDL Radar
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-center font-semibold">
                ABS Checker
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-center font-semibold">
                What-If Simulator
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-600" /></div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                Layer 4: Multi-Agent Audit & Verification Pipeline
              </span>
              <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                Autonomous Verification
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-200">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-blue-300 block mb-0.5">🔍 Researcher Agent</strong>
                <p className="text-[11px] text-slate-400">Scans legal & classical databases for prior art.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-300 block mb-0.5">🛡️ Auditor Agent</strong>
                <p className="text-[11px] text-slate-400">Verifies statutory provisions & law dates.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">😈 Devil's Advocate</strong>
                <p className="text-[11px] text-slate-400">Stress-tests claims against Patent Sec 3(p).</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-purple-300 block mb-0.5">🎯 Strategist Agent</strong>
                <p className="text-[11px] text-slate-400">Formulates IP, TM & ABS filing roadmaps.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-600" /></div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                Layer 3: Legal Graph RAG & Citation Engine
              </span>
              <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                Retrieval Engine
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Combines lexical BM25 matching, dense vector embeddings, and knowledge graph node-link expansion to maintain zero-hallucination statutory grounding.
            </p>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-600" /></div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                Layer 2: Dual Jurisdiction & Intent Router
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Routing Logic
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-emerald-300 block">🇮🇳 India Domestic Regime</strong>
                <p className="text-[11px] text-slate-400">Patents Act 1970 (Sec 3p/3d) + BD Act 2023 + D&C Act SLA Licensing</p>
              </div>
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <strong className="text-cyan-300 block">🌐 International Export Regime</strong>
                <p className="text-[11px] text-slate-400">WIPO GRATK Treaty 2024 + EU THMPD Directive + US FDA NDIN Rules</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-600" /></div>

          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                Layer 1: Version-Tracked Statutory & Classical Data Layer
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Knowledge Base
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">The Patents Act, 1970 (2024 Rules)</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">Biological Diversity Act (2023 Amendment)</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">TKDL Sanskrit & Tamil Corpora</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">FSSAI Ayurveda Aahar Regs 2022</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">WIPO GRATK Treaty 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
