import React from 'react';
import type { IPReadinessPassport as PassportType } from '../types';
import { Globe, AlertCircle, CheckCircle2, Download, Award, Sparkles } from 'lucide-react';

interface ReadinessPassportProps {
  passport: PassportType;
}

export const ReadinessPassport: React.FC<ReadinessPassportProps> = ({ passport }) => {
  // Compute points for SVG Radar Spider Chart (radius 80, center 100,100)
  const scores = [
    { label: 'Patentability', val: passport.patentabilityScore },
    { label: 'TK Clearance', val: passport.tkClearanceScore },
    { label: 'ABS Duty', val: passport.absComplianceScore },
    { label: 'Regulatory', val: passport.regulatoryReadinessScore },
    { label: 'Export Readiness', val: passport.exportReadinessScore },
  ];

  const getPoint = (index: number, value: number, maxRadius = 70) => {
    const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = scores.map((s, i) => {
    const p = getPoint(i, s.val);
    return `${p.x},${p.y}`;
  }).join(' ');

  const handlePrintPdf = () => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      alert('Passport export ready! (Please allow popups to save official PDF)');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AYUSH IP & Regulatory Readiness Passport — SIH 26045</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #065f46; }
          .subtitle { font-size: 13px; color: #475569; margin-top: 5px; }
          .badge { display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-size: 11px; border-radius: 4px; font-weight: bold; }
          .score-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .score-num { font-size: 36px; font-weight: font-bold; color: #047857; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: bold; }
          .section-title { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #10b981; padding-left: 8px; }
          .blocker-item { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 6px; }
          .roadmap-item { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 6px; }
          .footer { margin-top: 40px; border-t: 1px solid #e2e8f0; pt-15px; font-size: 10px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="badge">OFFICIAL EVALUATION PASSPORT • SIH 26045</span>
          <div class="title">AYUSH IP & Regulatory Readiness Passport</div>
          <div class="subtitle">Grounded in Patents Act 1970/2024, BD Act 2023, TKDL & WIPO GRATK Treaty 2024</div>
        </div>

        <div class="score-box">
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #64748b;">OVERALL READINESS SCORE</div>
            <div class="score-num">${passport.overallScore} / 100</div>
            <div style="font-size: 12px; font-weight: bold; color: #d97706; margin-top: 4px;">Status: Conditional Commercialization Readiness</div>
          </div>
          <div style="font-size: 11px; text-align: right; color: #64748b;">
            Date Generated: ${new Date().toLocaleDateString()}<br/>
            Certificate ID: PASSPORT-2026-AYUSH-882
          </div>
        </div>

        <div class="section-title">Multi-Dimensional Dimension Breakdown</div>
        <table class="table">
          <thead>
            <tr>
              <th>Evaluation Dimension</th>
              <th>Score</th>
              <th>Status / Regulatory Posture</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Patentability Readiness</td>
              <td><strong>${passport.patentabilityScore}%</strong></td>
              <td>Process Patent Eligible; Product restricted by Sec 3(p) TK bar</td>
            </tr>
            <tr>
              <td>TKDL Prior-Art Clearance</td>
              <td><strong>${passport.tkClearanceScore}%</strong></td>
              <td>Traditional Knowledge overlap detected; defensive TKDL citation required</td>
            </tr>
            <tr>
              <td>ABS Biodiversity Duty</td>
              <td><strong>${passport.absComplianceScore}%</strong></td>
              <td>Mandatory NBA Section 6 Form III pre-approval required</td>
            </tr>
            <tr>
              <td>Regulatory SLA / FSSAI Readiness</td>
              <td><strong>${passport.regulatoryReadinessScore}%</strong></td>
              <td>Rule 158B active marker validation compliant</td>
            </tr>
            <tr>
              <td>International Export Readiness</td>
              <td><strong>${passport.exportReadinessScore}%</strong></td>
              <td>WIPO 2024 country-of-origin disclosure required</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Critical Risk Items & Blockers</div>
        ${passport.criticalBlockers.map(b => `<div class="blocker-item">• ${b}</div>`).join('')}

        <div class="section-title">Recommended Action Roadmap</div>
        ${passport.recommendedRoadmap.map((r, i) => `<div class="roadmap-item"><strong>${i+1}.</strong> ${r}</div>`).join('')}

        <div class="footer">
          IP-SAKTI Sahayak Prototype — SIH 26045 • Ministry of Ayush & Patent Office Decision Engine • Source-Cited & Audit Ready
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Ayurvedic IP & Regulatory Readiness Passport
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized readiness passport for AYUSH Startups & MSMEs seeking commercialization & export clearance.
          </p>
        </div>
        
        <button
          onClick={handlePrintPdf}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          Export Official Passport PDF
        </button>
      </div>

      {/* Score Overview Banner with Radar Chart */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Standardized Evaluation Index</span>
          </div>

          <h3 className="text-4xl font-extrabold text-white font-display mt-1">
            {passport.overallScore} <span className="text-slate-400 text-xl font-normal">/ 100</span>
          </h3>

          <p className="text-xs text-slate-300 mt-2">
            Status: <span className="text-amber-300 font-bold">Conditional Commercialization Readiness</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Grounded in Patents Act 1970 (Sec 3p/3d), Biological Diversity Act 2023, TKDL & WIPO GRATK Treaty 2024.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Patentability</span>
              <strong className="text-sm font-mono text-emerald-400">{passport.patentabilityScore}%</strong>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">TK Clearance</span>
              <strong className="text-sm font-mono text-amber-400">{passport.tkClearanceScore}%</strong>
            </div>
          </div>
        </div>

        {/* SVG Radar Spider Chart */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Multi-Dimensional Profile Radar
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
                stroke="#334155"
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
                  stroke="#334155"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Score Polygon */}
            <polygon
              points={polyPoints}
              fill="rgba(16, 185, 129, 0.35)"
              stroke="#10b981"
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
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Blockers & Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Blockers */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" />
            Critical Blockers & Risk Items
          </h3>

          <div className="space-y-2">
            {passport.criticalBlockers.map((blocker, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">•</span>
                <span>{blocker}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Roadmap */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Strategic Action Roadmap
          </h3>

          <div className="space-y-2">
            {passport.recommendedRoadmap.map((step, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
