import React from 'react';
import type { IPReadinessPassport, QueryResult } from '../types';
import { Globe, Award, CheckCircle2, AlertTriangle, Sparkles, Shield, Compass, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { ExportRolloutButton } from './ExportRolloutButton';

interface ReadinessPassportProps {
  passport?: IPReadinessPassport;
  result?: QueryResult;
}

const DEFAULT_PASSPORT: IPReadinessPassport = {
  overallScore: 74,
  patentabilityScore: 70,
  tkClearanceScore: 66,
  absComplianceScore: 80,
  regulatoryReadinessScore: 78,
  exportReadinessScore: 72,
  criticalBlockers: [
    'Section 3(p) prior art overlap risk for standard herbal extract formulation',
    'Mandatory National Biodiversity Authority (NBA) Form III pre-approval required under BD Act 2023',
    'Section 3(d) synergistic bio-activity data required to overcome efficacy objection'
  ],
  recommendedRoadmap: [
    'File Process Patent focusing on novel hydro-alcoholic extraction ratio & synergistic efficacy data',
    'Submit Form III application to National Biodiversity Authority under Section 6 of BD Act 2023',
    'Perform formal TKDL prior-art clearance search across Sanskrit & Tamil classical texts',
    'Register Trademark in Class 5 (AYUSH / Pharmaceuticals & Wellness)',
    'Obtain State Licensing Authority (SLA) License under Drugs & Cosmetics Rule 158B',
    'Prepare EMA Traditional Herbal Medicinal Products Directive (THMPD) dossier for target EU export'
  ]
};

export const ReadinessPassport: React.FC<ReadinessPassportProps> = ({ passport, result }) => {
  const isCustomAudit = Boolean(passport && passport.overallScore !== undefined && passport.overallScore > 0);

  const safePassport: IPReadinessPassport = {
    overallScore: isCustomAudit ? passport!.overallScore : DEFAULT_PASSPORT.overallScore,
    patentabilityScore: (passport?.patentabilityScore && passport.patentabilityScore > 0) ? passport.patentabilityScore : DEFAULT_PASSPORT.patentabilityScore,
    tkClearanceScore: (passport?.tkClearanceScore && passport.tkClearanceScore > 0) ? passport.tkClearanceScore : DEFAULT_PASSPORT.tkClearanceScore,
    absComplianceScore: (passport?.absComplianceScore && passport.absComplianceScore > 0) ? passport.absComplianceScore : DEFAULT_PASSPORT.absComplianceScore,
    regulatoryReadinessScore: (passport?.regulatoryReadinessScore && passport.regulatoryReadinessScore > 0) ? passport.regulatoryReadinessScore : DEFAULT_PASSPORT.regulatoryReadinessScore,
    exportReadinessScore: (passport?.exportReadinessScore && passport.exportReadinessScore > 0) ? passport.exportReadinessScore : DEFAULT_PASSPORT.exportReadinessScore,
    criticalBlockers: (passport?.criticalBlockers && passport.criticalBlockers.length > 0) ? passport.criticalBlockers : DEFAULT_PASSPORT.criticalBlockers,
    recommendedRoadmap: (passport?.recommendedRoadmap && passport.recommendedRoadmap.length > 0) ? passport.recommendedRoadmap : DEFAULT_PASSPORT.recommendedRoadmap,
  };

  const dummyResult: QueryResult = {
    queryId: result?.queryId || `passport-${Date.now()}`,
    userQuery: result?.userQuery || 'Ayurvedic IP Readiness Audit',
    jurisdiction: result?.jurisdiction || 'INDIA',
    classification: result?.classification || {
      category: 'PROPRIETARY_MEDICINE',
      title: 'Ayurvedic Formulation',
      confidence: 88,
      description: 'Standardized evaluation under Indian Patents Act 1970 and Biological Diversity Act 2023.',
      regulatoryBody: 'AYUSH Ministry / CDSCO',
      evidenceRequirements: [],
      ipPosture: 'Conditional Patentability',
      absPosture: 'NBA Approval Mandatory'
    },
    ipMap: result?.ipMap || [],
    absAnalysis: result?.absAnalysis || {
      isApplicable: true,
      resourceOrigin: 'Indian Biological Resources',
      dutyType: 'APPROVAL_REQUIRED',
      authority: 'National Biodiversity Authority (NBA, Chennai)',
      statutoryBasis: 'BD Act 2023',
      requiredActions: []
    },
    tkOverlap: result?.tkOverlap || [],
    readinessPassport: safePassport,
    agentSteps: result?.agentSteps || [],
    citations: result?.citations || [],
    nodes: result?.nodes || [],
    edges: result?.edges || [],
    legalDisclaimer: result?.legalDisclaimer || 'DISCLAIMER: IP-SAKTI Sahayak official decision report.'
  };

  const pillars = [
    {
      key: 'patentability',
      label: 'Patentability',
      shortLabel: 'Patent',
      val: safePassport.patentabilityScore,
      law: 'Sec 3(p) & 3(d)',
      desc: 'Novelty & synergistic efficacy hurdles',
      color: '#4285f4', // Google Blue
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      key: 'tk',
      label: 'TK Clearance',
      shortLabel: 'TKDL',
      val: safePassport.tkClearanceScore,
      law: 'Patents Act 1970',
      desc: 'Classical Samhitas prior-art bar clearance',
      color: '#34a853', // Google Green
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      key: 'abs',
      label: 'ABS Duty',
      shortLabel: 'NBA / ABS',
      val: safePassport.absComplianceScore,
      law: 'BD Act 2023 Sec 6',
      desc: 'NBA Form III approval & Nagoya Protocol',
      color: '#fbbc05', // Google Yellow
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      key: 'regulatory',
      label: 'Regulatory Fit',
      shortLabel: 'AYUSH / SLA',
      val: safePassport.regulatoryReadinessScore,
      law: 'D&C Rule 158B',
      desc: 'SLA licensing, HPLC assay & safety specs',
      color: '#ea4335', // Google Red
      textColor: 'text-rose-600',
      bgLight: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    {
      key: 'export',
      label: 'Export Readiness',
      shortLabel: 'Global / PCT',
      val: safePassport.exportReadinessScore,
      law: 'PCT / THMPD / FDA',
      desc: 'International filings & target pharmacopoeias',
      color: '#8b5cf6', // Violet
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200',
    }
  ];

  const numSides = pillars.length;
  const angleStep = (Math.PI * 2) / numSides;
  const centerX = 130;
  const centerY = 130;
  const maxRadius = 80;

  const getPoint = (index: number, val: number, radiusScale: number = maxRadius) => {
    const r = (val / 100) * radiusScale;
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = pillars
    .map((p, i) => {
      const pt = getPoint(i, p.val);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  // Status computation
  const overall = safePassport.overallScore;
  const statusConfig = overall >= 75
    ? { text: 'High Commercialization Readiness', tag: 'High Readiness', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
    : overall >= 60
    ? { text: 'Conditional Commercialization Readiness', tag: 'Conditional', bg: 'bg-blue-50 text-blue-900 border-blue-300' }
    : { text: 'Substantial Regulatory Blockers Identified', tag: 'High Risk', bg: 'bg-rose-50 text-rose-800 border-rose-300' };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-950 space-y-7 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Ambient Halo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-r from-[#34a853]/10 via-[#4285f4]/10 to-[#fbbc05]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-display text-slate-950 tracking-tight">
                  Ayurvedic IP & Regulatory Readiness Passport
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg}`}>
                  {statusConfig.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Standardized 5-Pillar Scorecard for AYUSH Innovators, Startups & MSMEs commercializing bio-resources.
              </p>
            </div>
          </div>
        </div>

        {/* Export Rollout Button: PDF & Word */}
        <div className="shrink-0 flex items-center gap-2">
          <ExportRolloutButton result={dummyResult} label="Export Passport" />
        </div>
      </div>

      {/* Reference Benchmark Notice if not an explicit custom formulation */}
      {!isCustomAudit && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 relative z-10">
          <Compass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Standardized Reference Benchmark Profile</span>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              Displaying standardized reference benchmark for botanical extraction formulation. Submit an active formulation query (e.g. <em>&ldquo;Ashwagandha 500mg hydro-alcoholic extract capsule&rdquo;</em>) in the AI Assistant to generate custom real-time audit scores.
            </p>
          </div>
        </div>
      )}

      {/* Score Overview Banner with Radar Chart */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden shadow-xs">
        {/* Left Column: Big Overall Score + Info */}
        <div className="lg:col-span-6 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-950 font-mono text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span>Composite Commercialization Index</span>
          </div>

          <div className="flex items-baseline gap-3">
            <h3 className="text-5xl sm:text-6xl font-black text-slate-950 font-display tracking-tight">
              {safePassport.overallScore}
            </h3>
            <span className="text-slate-500 text-2xl font-bold font-mono">/ 100</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-slate-950" />
              <span>Status: <strong className="text-slate-950">{statusConfig.text}</strong></span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              Grounded in Indian Patents Act 1970 (Sec 3p/3d), Biological Diversity Act 2023, TKDL classical texts, and WIPO GRATK Treaty 2024.
            </p>
          </div>

          {/* Mini Score Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-mono font-medium">Patentability</span>
              <strong className="text-base font-mono text-blue-600 font-extrabold">{safePassport.patentabilityScore}%</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-mono font-medium">TK Clearance</span>
              <strong className="text-base font-mono text-emerald-600 font-extrabold">{safePassport.tkClearanceScore}%</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block font-mono font-medium">ABS Duty</span>
              <strong className="text-base font-mono text-amber-600 font-extrabold">{safePassport.absComplianceScore}%</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Labeled SVG Radar Spider Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative z-10">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-950 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              5-Pillar Profile Radar
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Normalized (0-100)</span>
          </div>

          <div className="w-full max-w-[280px] aspect-square flex items-center justify-center select-none">
            <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
              {/* Concentric grid rings */}
              {[0.25, 0.5, 0.75, 1].map((level, i) => (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * level}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={level === 1 ? 'none' : '3,3'}
                />
              ))}

              {/* Grid percentage levels */}
              {[25, 50, 75, 100].map((pct, i) => (
                <text
                  key={i}
                  x={centerX + 2}
                  y={centerY - (maxRadius * (pct / 100)) + 3}
                  fontSize="7"
                  fill="#94a3b8"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  {pct}
                </text>
              ))}

              {/* Spokes */}
              {pillars.map((_, i) => {
                const p = getPoint(i, 100);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={p.x}
                    y2={p.y}
                    stroke="#e2e8f0"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Filled Polygon */}
              <polygon
                points={polyPoints}
                fill="rgba(66, 133, 244, 0.18)"
                stroke="#1e293b"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* Vertex Dots & Score Value Points */}
              {pillars.map((p, i) => {
                const pt = getPoint(i, p.val);
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill={p.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* Spoke Axis Labels */}
              {pillars.map((p, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const labelRadius = maxRadius + 26;
                const lx = centerX + labelRadius * Math.cos(angle);
                const ly = centerY + labelRadius * Math.sin(angle);
                const isLeft = Math.cos(angle) < -0.2;
                const isRight = Math.cos(angle) > 0.2;
                const textAnchor = isRight ? 'start' : (isLeft ? 'end' : 'middle');

                return (
                  <g key={i} className="select-none">
                    <text
                      x={lx}
                      y={ly - 4}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#0f172a"
                      textAnchor={textAnchor}
                      fontFamily="system-ui, sans-serif"
                    >
                      {p.shortLabel}
                    </text>
                    <text
                      x={lx}
                      y={ly + 6}
                      fontSize="8.5"
                      fontWeight="bold"
                      fill={p.color}
                      textAnchor={textAnchor}
                      fontFamily="monospace"
                    >
                      {p.val}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 5-Pillar Score Cards Grid */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-950" />
            Detailed Statutory Pillar Breakdown
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">5 Evaluation Regimes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                    <span>{pillar.label}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">{pillar.law}</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black font-mono ${pillar.textColor}`}>
                    {pillar.val}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pillar.val}%`, backgroundColor: pillar.color }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Blockers & Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Critical Blockers */}
        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3.5 relative overflow-hidden group hover:border-rose-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
            <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Critical Blockers & Risk Items ({safePassport.criticalBlockers.length})
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Statutory Bar Risks
            </span>
          </div>

          <div className="space-y-2.5">
            {safePassport.criticalBlockers.map((blocker: string, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 font-medium flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[11px]">
                  !
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-950 font-semibold block leading-snug">{blocker}</span>
                  <span className="text-[10px] text-slate-500 block">Requires documentary clearance before IP grant</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Roadmap */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3.5 relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Strategic Action Roadmap ({safePassport.recommendedRoadmap.length} Steps)
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Milestone Sequence
            </span>
          </div>

          <div className="space-y-2.5">
            {safePassport.recommendedRoadmap.map((step: string, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-900 font-medium flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[11px]">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-950 font-semibold block leading-snug">{step}</span>
                  <span className="text-[10px] text-emerald-700 block font-mono">Recommended action milestone</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
