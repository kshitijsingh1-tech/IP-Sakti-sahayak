import React from 'react';
import type { TKOverlapMatch } from '../types';
import { BookOpen, ShieldAlert, Sparkles } from 'lucide-react';

interface TKDLRadarProps {
  matches: TKOverlapMatch[];
}

export const TKDLRadar: React.FC<TKDLRadarProps> = ({ matches }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-display text-white">
              TKDL Prior-Art Overlap Radar & Defense Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detecting traditional knowledge prior-art overlap across Sanskrit/Tamil classical corpora & TKDL international classifications.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono text-xs border border-amber-500/30">
          Section 3(p) Audit Active
        </span>
      </div>

      {/* Terminology Normalization Matrix */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <h3 className="text-xs font-bold font-display text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Multilingual Terminology Normalization Mapping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">User Query Concept</span>
            <strong className="text-emerald-300 text-sm">Ashwagandha Extract</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">Ayurvedic Sanskrit Entity</span>
            <strong className="text-amber-300 text-sm">अश्वगंधा (Balya / Rasayana)</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">Botanical Taxon</span>
            <strong className="text-cyan-300 font-mono text-xs">Withania somnifera (Dunal)</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">Modern Bioactive Marker</span>
            <strong className="text-purple-300 text-xs">Withanolide A & D, Glycowithanolides</strong>
          </div>
        </div>
      </div>

      {/* Overlap Matches */}
      <div className="space-y-4">
        {matches.map((match, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{match.classicalText}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    match.status === 'PRIOR_ART_BAR'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {match.status === 'PRIOR_ART_BAR' ? '⚠️ Section 3(p) Bar Triggered' : '✓ Novelty Clearance Potential'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Entity: <span className="text-amber-300 font-medium">{match.ayurvedicName}</span> • Botanical: <span className="font-mono text-cyan-300">{match.botanicalName}</span>
                </p>
              </div>

              {/* Overlap Meter */}
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-amber-400">{match.overlapScore}%</div>
                <span className="text-[10px] text-slate-500">TK Similarity Score</span>
              </div>
            </div>

            {/* Overlap Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 mb-3 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  match.overlapScore > 70 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${match.overlapScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
              <strong className="text-amber-300">Detailed Findings: </strong>
              {match.similarityDetails}
            </p>
          </div>
        ))}
      </div>

      {/* Defensive TK Shield Note */}
      <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-300 mb-1">Strategic IP Defensive Insight</h4>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Under Patents Act Section 3(p), traditional Ayurvedic formulations cannot be patented as raw products in India. However, foreign patent applications filed abroad without citing TKDL can be invalidated using TKDL evidence files. To obtain patent protection, file for a <strong>Process Patent on standardized hydro-alcoholic extraction ratios</strong> with proven synergistic bio-efficacy data under Sec 3(d).
          </p>
        </div>
      </div>
    </div>
  );
};
