import React from 'react';
import { Cpu, ArrowDown } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 relative overflow-hidden">
        {/* Google 4-Color Ambient Rainbow Halo Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-slate-950" />
              <h2 className="text-lg font-bold font-display text-slate-950">
                IP-SAKTI Sahayak — 5-Layer Architectural Blueprint
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Complete technical topology illustrating how multi-agent audit loops and legal Graph RAG produce 100% auditable decisions.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-950 font-mono text-xs border border-slate-300 font-bold">
            System Topology v2.4
          </span>
        </div>

        {/* 5-Layer Flow */}
        <div className="space-y-4 relative z-10">
          {/* Layer 5 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">
                Layer 5: Interactive Application Suite
              </span>
              <span className="text-[10px] text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                User Interface
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-950 font-bold relative z-10">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
                RAG Assistant
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
                Product Classifier
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
                TKDL Radar
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
                ABS Checker
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
                What-If Simulator
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-400" /></div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">
                Layer 4: Multi-Agent Audit & Verification Pipeline
              </span>
              <span className="text-[10px] text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                Autonomous Verification
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-950 font-bold relative z-10">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block mb-0.5">🔍 Researcher Agent</strong>
                <p className="text-[11px] text-slate-600 font-normal">Scans legal & classical databases for prior art.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block mb-0.5">🛡️ Auditor Agent</strong>
                <p className="text-[11px] text-slate-600 font-normal">Verifies statutory provisions & law dates.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block mb-0.5">😈 Devil's Advocate</strong>
                <p className="text-[11px] text-slate-600 font-normal">Stress-tests claims against Patent Sec 3(p).</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block mb-0.5">🎯 Strategist Agent</strong>
                <p className="text-[11px] text-slate-600 font-normal">Formulates IP, TM & ABS filing roadmaps.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-400" /></div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">
                Layer 3: Legal Graph RAG & Citation Engine
              </span>
              <span className="text-[10px] text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                Retrieval Engine
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium relative z-10">
              Combines lexical BM25 matching, dense vector embeddings, and knowledge graph node-link expansion to maintain zero-hallucination statutory grounding.
            </p>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-400" /></div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">
                Layer 2: Dual Jurisdiction & Intent Router
              </span>
              <span className="text-[10px] text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                Routing Logic
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-950 font-bold relative z-10">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block">🇮🇳 India Domestic Regime</strong>
                <p className="text-[11px] text-slate-600 font-normal">Patents Act 1970 (Sec 3p/3d) + BD Act 2023 + D&C Act SLA Licensing</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <strong className="text-slate-950 block">🌐 International Export Regime</strong>
                <p className="text-[11px] text-slate-600 font-normal">WIPO GRATK Treaty 2024 + EU THMPD Directive + US FDA NDIN Rules</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-400" /></div>

          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">
                Layer 1: Version-Tracked Statutory & Classical Data Layer
              </span>
              <span className="text-[10px] text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                Knowledge Base
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-950 font-bold relative z-10">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">The Patents Act, 1970 (2024 Rules)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">Biological Diversity Act (2023 Amendment)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">TKDL Sanskrit & Tamil Corpora</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">FSSAI Ayurveda Aahar Regs 2022</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">WIPO GRATK Treaty 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
