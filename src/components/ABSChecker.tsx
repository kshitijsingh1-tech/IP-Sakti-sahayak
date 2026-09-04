import React from 'react';
import type { ABSAnalysis } from '../types';
import { Shield, FileCheck, DollarSign, Leaf, AlertCircle } from 'lucide-react';

interface ABSCheckerProps {
  analysis: ABSAnalysis;
}

export const ABSChecker: React.FC<ABSCheckerProps> = ({ analysis }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Halo Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-bold font-display text-slate-950">
              Access & Benefit Sharing (ABS) Biodiversity Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Compliance under Biological Diversity Act 2002 (Amended 2023, Rules 2024) & Nagoya Protocol.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-950 font-mono text-xs border border-slate-300 font-bold">
          NBA Section 6 Mandatory Check
        </span>
      </div>

      {/* Biological Resource Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
        {/* Google Rainbow Hover Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-bold text-slate-950 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-slate-950" />
            Target Biological Resource
          </span>
          <span className="text-xs font-mono text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
            {analysis.authority}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-950 font-mono relative z-10">{analysis.resourceOrigin}</p>
        <p className="text-xs text-slate-600 mt-1 relative z-10">Statutory Authority: {analysis.statutoryBasis}</p>
      </div>

      {/* Kani Model Insight Callout */}
      {analysis.kaniModelInsight && (
        <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
          {/* Google Rainbow Hover Halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center gap-2 mb-2 relative z-10">
            <DollarSign className="w-4 h-4 text-slate-950" />
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
              Kani Community / Arogyapacha Benefit-Sharing Benchmark
            </h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans relative z-10">{analysis.kaniModelInsight}</p>
        </div>
      )}

      {/* Mandatory Action Checklist */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider">
          Mandatory ABS Compliance Steps
        </h3>

        {analysis.requiredActions.map((action, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-slate-400 hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* Google Rainbow Hover Halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-950 border border-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                {idx + 1}
              </span>
              <span className="text-xs font-bold text-slate-950">{action}</span>
            </div>
            <FileCheck className="w-4 h-4 text-slate-950 relative z-10" />
          </div>
        ))}
      </div>

      {/* Penalty / Non-Compliance Warning */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
        {/* Google Rainbow Hover Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <AlertCircle className="w-5 h-5 text-slate-950 shrink-0 mt-0.5 relative z-10" />
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-slate-950 mb-1">Non-Compliance Legal Risk</h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            Filing a patent in India or abroad using Indian biological resources without prior NBA Section 6 approval invalidates the patent grant and triggers statutory fines under Section 55 of the Biological Diversity Act.
          </p>
        </div>
      </div>
    </div>
  );
};
