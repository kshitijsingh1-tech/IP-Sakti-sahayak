import React from 'react';
import type { ABSAnalysis } from '../types';
import { Shield, FileCheck, DollarSign, Leaf, AlertCircle } from 'lucide-react';

interface ABSCheckerProps {
  analysis: ABSAnalysis;
}

export const ABSChecker: React.FC<ABSCheckerProps> = ({ analysis }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Access & Benefit Sharing (ABS) Biodiversity Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compliance under Biological Diversity Act 2002 (Amended 2023, Rules 2024) & Nagoya Protocol.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-xs border border-emerald-500/30">
          NBA Section 6 Mandatory Check
        </span>
      </div>

      {/* Biological Resource Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            Target Biological Resource
          </span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {analysis.authority}
          </span>
        </div>
        <p className="text-sm font-semibold text-white font-mono">{analysis.resourceOrigin}</p>
        <p className="text-xs text-slate-400 mt-1">Statutory Authority: {analysis.statutoryBasis}</p>
      </div>

      {/* Kani Model Insight Callout */}
      {analysis.kaniModelInsight && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Kani Community / Arogyapacha Benefit-Sharing Benchmark
            </h3>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">{analysis.kaniModelInsight}</p>
        </div>
      )}

      {/* Mandatory Action Checklist */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold font-display text-slate-300 uppercase tracking-wider">
          Mandatory ABS Compliance Steps
        </h3>

        {analysis.requiredActions.map((action, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center text-xs font-mono font-bold">
                {idx + 1}
              </span>
              <span className="text-xs font-medium text-slate-200">{action}</span>
            </div>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
        ))}
      </div>

      {/* Penalty / Non-Compliance Warning */}
      <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-rose-300 mb-1">Non-Compliance Legal Risk</h4>
          <p className="text-xs text-rose-200/80 leading-relaxed">
            Filing a patent in India or abroad using Indian biological resources without prior NBA Section 6 approval invalidates the patent grant and triggers statutory fines under Section 55 of the Biological Diversity Act.
          </p>
        </div>
      </div>
    </div>
  );
};
