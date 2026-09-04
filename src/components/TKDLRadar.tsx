import React from 'react';
import type { TKOverlapMatch } from '../types';
import { BookOpen, ShieldAlert, Sparkles } from 'lucide-react';

interface TKDLRadarProps {
  matches: TKOverlapMatch[];
}

export const TKDLRadar: React.FC<TKDLRadarProps> = ({ matches }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Halo Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-bold font-display text-slate-950">
              TKDL Prior-Art Overlap Radar & Defense Engine
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Detecting traditional knowledge prior-art overlap across Sanskrit/Tamil classical corpora & TKDL international classifications.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-950 font-mono text-xs border border-slate-300 font-bold">
          Section 3(p) Audit Active
        </span>
      </div>

      {/* Terminology Normalization Matrix */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
        {/* Google Rainbow Hover Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <h3 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-2 relative z-10">
          <Sparkles className="w-4 h-4 text-slate-950" />
          Multilingual Terminology Normalization Mapping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs relative z-10">
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block font-mono">User Query Concept</span>
            <strong className="text-slate-950 text-sm font-bold block mt-0.5">Ashwagandha Extract</strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block font-mono">Ayurvedic Sanskrit Entity</span>
            <strong className="text-slate-950 text-sm font-bold block mt-0.5">अश्वगंधा (Balya / Rasayana)</strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block font-mono">Botanical Taxon</span>
            <strong className="text-slate-950 font-mono text-xs font-bold block mt-0.5">Withania somnifera (Dunal)</strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block font-mono">Modern Bioactive Marker</span>
            <strong className="text-slate-950 text-xs font-bold block mt-0.5">Withanolide A & D, Glycowithanolides</strong>
          </div>
        </div>
      </div>

      {/* Overlap Matches */}
      <div className="space-y-4">
        {matches.map((match, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-950">{match.classicalText}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-950 border border-slate-300">
                    {match.status === 'PRIOR_ART_BAR' ? 'Section 3(p) Bar Triggered' : '✓ Novelty Clearance Potential'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Entity: <span className="text-slate-950 font-bold">{match.ayurvedicName}</span> • Botanical: <span className="font-mono text-slate-950 font-bold">{match.botanicalName}</span>
                </p>
              </div>

              {/* Overlap Meter */}
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-slate-950">{match.overlapScore}%</div>
                <span className="text-[10px] text-slate-500">TK Similarity Score</span>
              </div>
            </div>

            {/* Overlap Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden border border-slate-200 relative z-10">
              <div
                className="h-full rounded-full bg-slate-950 transition-all duration-700"
                style={{ width: `${match.overlapScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans relative z-10">
              <strong className="text-slate-950 font-bold">Detailed Findings: </strong>
              {match.similarityDetails}
            </p>
          </div>
        ))}
      </div>

      {/* Defensive TK Shield Note */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
        {/* Google Rainbow Hover Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <ShieldAlert className="w-5 h-5 text-slate-950 shrink-0 mt-0.5 relative z-10" />
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-slate-950 mb-1">Strategic IP Defensive Insight</h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            Under Patents Act Section 3(p), traditional Ayurvedic formulations cannot be patented as raw products in India. However, foreign patent applications filed abroad without citing TKDL can be invalidated using TKDL evidence files. To obtain patent protection, file for a <strong className="text-slate-950">Process Patent on standardized hydro-alcoholic extraction ratios</strong> with proven synergistic bio-efficacy data under Sec 3(d).
          </p>
        </div>
      </div>
    </div>
  );
};
