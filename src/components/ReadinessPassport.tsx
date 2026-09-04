import React from 'react';
import type { IPReadinessPassport } from '../types';
import { Globe, Award, Download, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ReadinessPassportProps {
  passport: IPReadinessPassport;
}

export const ReadinessPassport: React.FC<ReadinessPassportProps> = ({ passport }) => {
  const handlePrintPdf = () => {
    window.print();
  };

  const scores = [
    { label: 'Patentability', val: passport.patentabilityScore },
    { label: 'TK Clearance', val: passport.tkClearanceScore },
    { label: 'ABS Compliance', val: passport.absComplianceScore },
    { label: 'Clinical Proof', val: passport.regulatoryReadinessScore },
    { label: 'Regulatory Fit', val: passport.exportReadinessScore }
  ];

  const numSides = scores.length;
  const angleStep = (Math.PI * 2) / numSides;

  const getPoint = (index: number, val: number) => {
    const radius = (val / 100) * 70;
    const angle = index * angleStep - Math.PI / 2;
    const x = 100 + radius * Math.cos(angle);
    const y = 100 + radius * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = scores
    .map((s, i) => {
      const p = getPoint(i, s.val);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Halo Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-bold font-display text-slate-950">
              Ayurvedic IP & Regulatory Readiness Passport
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Standardized readiness passport for AYUSH Startups & MSMEs seeking commercialization & export clearance.
          </p>
        </div>
        
        <button
          onClick={handlePrintPdf}
          className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-slate-950"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          Export Official Passport PDF
        </button>
      </div>

      {/* Score Overview Banner with Radar Chart */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
        {/* Google Rainbow Hover Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-950 font-mono text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span>Standardized Evaluation Index</span>
          </div>

          <h3 className="text-4xl font-black text-slate-950 font-display mt-1">
            {passport.overallScore} <span className="text-slate-500 text-xl font-normal">/ 100</span>
          </h3>

          <p className="text-xs text-slate-800 font-bold mt-2">
            Status: <span className="text-slate-950 underline">Conditional Commercialization Readiness</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Grounded in Patents Act 1970 (Sec 3p/3d), Biological Diversity Act 2023, TKDL & WIPO GRATK Treaty 2024.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-mono">Patentability</span>
              <strong className="text-sm font-mono text-slate-950 font-bold">{passport.patentabilityScore}%</strong>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-mono">TK Clearance</span>
              <strong className="text-sm font-mono text-slate-950 font-bold">{passport.tkClearanceScore}%</strong>
            </div>
          </div>
        </div>

        {/* SVG Radar Spider Chart */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 shadow-xs relative z-10">
          <span className="text-[10px] font-mono text-slate-950 uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-slate-950" /> Multi-Dimensional Profile Radar
          </span>
          <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
            {/* Grid concentric circles */}
            {[0.25, 0.5, 0.75, 1].map((level, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={70 * level}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}

            {/* Radar Spokes */}
            {scores.map((_, i) => {
              const p = getPoint(i, 100);
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={p.x}
                  y2={p.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Score Polygon */}
            <polygon
              points={polyPoints}
              fill="rgba(15, 23, 42, 0.15)"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Polygon Corner Dots */}
            {scores.map((s, i) => {
              const p = getPoint(i, s.val);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Blockers & Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Critical Blockers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
          {/* Google Rainbow Hover Halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
            <AlertCircle className="w-4 h-4 text-slate-950" />
            Critical Blockers & Risk Items
          </h3>

          <div className="space-y-2 relative z-10">
            {passport.criticalBlockers.map((blocker: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-bold flex items-start gap-2 shadow-xs">
                <span className="text-slate-950 font-bold shrink-0">•</span>
                <span>{blocker}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Roadmap */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
          {/* Google Rainbow Hover Halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            Strategic Action Roadmap
          </h3>

          <div className="space-y-2 relative z-10">
            {passport.recommendedRoadmap.map((step: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-bold flex items-start gap-2 shadow-xs">
                <span className="text-slate-950 font-mono font-bold shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
