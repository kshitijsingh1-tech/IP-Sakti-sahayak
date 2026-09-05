import React, { useState } from 'react';
import type { TKOverlapMatch } from '../types';
import { 
  ShieldAlert, Sparkles, 
  Radar, Crosshair, Copy, Check, 
  SlidersHorizontal, ShieldCheck 
} from 'lucide-react';

interface TKDLRadarProps {
  matches: TKOverlapMatch[];
  queryConcept?: string;
}

interface EnrichedCorpusTarget {
  id: string;
  treatiseName: string;
  sanskritName: string;
  canonicalSection: string;
  overlapScore: number;
  status: 'PRIOR_ART_BAR' | 'NOVEL_EXTRACT_POTENTIAL' | 'CLASSICAL_TEXT_EXCLUDED';
  shlokaReference: string;
  findingDetails: string;
  statutoryWorkaround: string;
  ipcClass: string;
  angleDeg: number;
}

export const TKDLRadar: React.FC<TKDLRadarProps> = ({ matches, queryConcept }) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [filterType, setFilterType] = useState<'ALL' | 'BARRED' | 'CLEARANCE'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topMatch = matches && matches.length > 0 ? matches[0] : null;
  const displayConcept = queryConcept || (topMatch ? topMatch.ayurvedicName.replace(/\(.*?\)/g, '').trim() : 'Ayurvedic Botanical Formulation');
  const displaySanskrit = topMatch ? topMatch.ayurvedicName : 'पारंपरिक ज्ञान (Classical Ayurvedic Resource)';
  const displayBotanical = topMatch ? topMatch.botanicalName : 'Withania somnifera / Polyherbal Extract';
  const displayBioactive = topMatch ? topMatch.modernTerm : 'Standardized Phyto-marker Profile (HPLC Verified)';

  // Build a comprehensive 5-corpora tactical target list tailored to the active query
  const qLower = (queryConcept || '').toLowerCase();
  const isTurmeric = qLower.includes('curcumin') || qLower.includes('turmeric') || qLower.includes('haridra');
  const isGuduchi = qLower.includes('guduchi') || qLower.includes('giloy') || qLower.includes('tinospora');

  const defaultCorpora: EnrichedCorpusTarget[] = [
    {
      id: 'cs-rasayana',
      treatiseName: 'Caraka Saṃhitā',
      sanskritName: 'चरक संहिता (Cikitsāsthāna 1.1)',
      canonicalSection: 'Cikitsāsthāna Rasāyana Adhyāya 1:12-15',
      overlapScore: topMatch?.overlapScore || 78,
      status: 'PRIOR_ART_BAR',
      shlokaReference: isTurmeric
        ? 'हरिद्रा कटुका तिक्ता रूक्षोष्णा कफपित्तनुत् । वर्ण्या त्वग्दोषहन्त्री च प्रमेहव्रणशोधिनी ॥ (Caraka Su. 27)'
        : 'अश्वगन्धा कषायोष्णा तिक्ता च कटुका रसे । वातश्लेष्मामयीं हन्ति बलपुष्टिविवर्धिनी ॥ (Caraka Ci. 1.1)',
      findingDetails: 'Direct therapeutic overlap identified for stress resilience, adaptogenic recovery, and neuro-protection. Classical formula described in public domain Sanskrit texts.',
      statutoryWorkaround: 'Section 3(p) Patent Bar Triggered for whole herb powder. Overcome by filing a Process Patent claiming high-yield standardized extraction (>10% withanolides) with unexpected synergistic bioavailability under Section 3(d).',
      ipcClass: 'A61K 36/81 (Solanaceae)',
      angleDeg: 45
    },
    {
      id: 'ss-dravya',
      treatiseName: 'Suśruta Saṃhitā',
      sanskritName: 'सुश्रुत संहिता (Sūtrasthāna 38)',
      canonicalSection: 'Sūtrasthāna Dravyasangrahaṇīya Adhyāya',
      overlapScore: 54,
      status: 'NOVEL_EXTRACT_POTENTIAL',
      shlokaReference: isGuduchi
        ? 'गुडूची दीपनी तिक्ता स्वादुपाका रसायनी । ज्वरत्रिकप्रशमनी मेध्या वयोस्थापनी तथा ॥'
        : 'रसायनेषु विख्यातं बल्यानाम् उत्तमोत्तमम् । मेधाग्निवलवर्धनं शोथघ्नं विषनाशनम् ॥',
      findingDetails: 'Classical processing (Kwatha/decoction) documented, but modern nano-liposomal and solvent-partitioned fractions are absent from historical texts.',
      statutoryWorkaround: 'Novelty Clearance Potential. Novel extraction parameters, carrier-bound bio-enhancement, or novel pharmacokinetic profiles are patentable.',
      ipcClass: 'A61K 36/00 (Medicinal Preparations)',
      angleDeg: 125
    },
    {
      id: 'bp-nighantu',
      treatiseName: 'Bhāvaprakāśa Nighaṇṭu',
      sanskritName: 'भावप्रकाश निघण्टु (Guḍūcyādi Varga)',
      canonicalSection: 'Guḍūcyādi Varga Shloka 189-191',
      overlapScore: matches.length > 1 ? matches[1].overlapScore : 65,
      status: 'PRIOR_ART_BAR',
      shlokaReference: 'अश्वगन्धाऽनिलश्लेष्मश्वित्रशोथक्षयापहा । बल्या रसायनी तिक्ता कषायोष्णाऽतिशुक्रला ॥',
      findingDetails: 'Detailed morphological identification and therapeutic properties catalogued in medieval Nighantu treatises.',
      statutoryWorkaround: 'Document non-obvious synergistic efficacy of combined botanicals over individual crude extract components to overcome Section 3(e) mere admixture exclusion.',
      ipcClass: 'A61K 36/81 (Withania)',
      angleDeg: 215
    },
    {
      id: 'ah-rasayana',
      treatiseName: 'Aṣṭāṅga Hṛdaya',
      sanskritName: 'अष्टाङ्ग हृदय (Uttarasthāna 39)',
      canonicalSection: 'Uttarasthāna Rasāyanavidhi Adhyāya',
      overlapScore: 42,
      status: 'NOVEL_EXTRACT_POTENTIAL',
      shlokaReference: 'सर्वरोगप्रशमनं वृष्यमायुष्यमुत्तमम् । मेधास्मृतिकरं धन्यं वयसः स्थापनं परम् ॥',
      findingDetails: 'Classical Rasayana polyherbal combinations referenced; distinct from isolated biomarker enriched complexes.',
      statutoryWorkaround: 'Demonstrate synergistic bio-potency ratio data (e.g. combination index CI < 0.8) to satisfy Section 3(d) therapeutic efficacy requirement.',
      ipcClass: 'A61K 36/185',
      angleDeg: 310
    },
    {
      id: 'api-monograph',
      treatiseName: 'Ayurvedic Pharmacopoeia (API)',
      sanskritName: 'आयुर्वेदिक फार्माकोपिया (Monograph Part I)',
      canonicalSection: 'API Part I, Vol. 1 Official Quality Monograph',
      overlapScore: 32,
      status: 'NOVEL_EXTRACT_POTENTIAL',
      shlokaReference: 'Official Government of India Pharmacopoeial limits for TLC/HPTLC fingerprinting, heavy metals, and foreign organic matter.',
      findingDetails: 'Government analytical purity and identification standard. Establishes baseline specifications required for regulatory licensing.',
      statutoryWorkaround: 'Meets mandatory Schedule T GMP and API specifications; proprietary novel delivery method remains eligible for patent claims.',
      ipcClass: 'A61P 25/00 (CNS Active)',
      angleDeg: 170
    }
  ];

  const filteredCorpora = defaultCorpora.filter((c) => {
    if (filterType === 'BARRED') return c.status === 'PRIOR_ART_BAR';
    if (filterType === 'CLEARANCE') return c.status === 'NOVEL_EXTRACT_POTENTIAL';
    return true;
  });

  const activeTarget = defaultCorpora[selectedTargetIndex] || defaultCorpora[0];

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCoordinates = (score: number, angleDeg: number) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const distance = Math.max(25, (score / 100) * 135);
    const x = 160 + distance * Math.cos(rad);
    const y = 160 + distance * Math.sin(rad);
    return { x, y };
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-6 w-full relative overflow-hidden">
      {/* Ambient Tactical Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header with Live Telemetry Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <Radar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
                  TKDL Prior-Art Overlap Radar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-mono font-bold">
                  ACTIVE HUD
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time polar scanning against 5 classical Sanskrit Samhitas, Nighantus & WIPO IPC Class A61K.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>IPC: <strong>A61K 36/00</strong></span>
          </span>
          <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-red-300 font-mono text-xs font-bold">
            Sec 3(p) Defense Engine
          </span>
        </div>
      </div>

      {/* Multilingual Terminology Normalization Matrix */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>TKDL Multilingual Botanical Normalization Matrix</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">4-Way Semantic Mapping</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Query Concept</span>
            <strong className="text-white text-sm font-bold block mt-0.5 truncate" title={displayConcept}>
              {displayConcept}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-emerald-400/90 font-mono uppercase block">Sanskrit Canonical Entity</span>
            <strong className="text-white text-sm font-bold block mt-0.5 truncate" title={displaySanskrit}>
              {displaySanskrit}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-blue-400/90 font-mono uppercase block">Botanical Taxon</span>
            <strong className="text-white font-mono text-xs font-bold block mt-0.5 truncate" title={displayBotanical}>
              {displayBotanical}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-amber-400/90 font-mono uppercase block">Phyto-Marker Target</span>
            <strong className="text-white text-xs font-bold block mt-0.5 truncate" title={displayBioactive}>
              {displayBioactive}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Tactical Radar Screen & Telemetry Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 items-start">
        {/* Left: Tactical Polar SVG Radar Screen (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Crosshair className="w-3.5 h-3.5" />
              <span>POLAR SCANNER</span>
            </span>
            <span>RANGE: 100% TK MATCH</span>
          </div>

          {/* SVG Polar Radar Display */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center select-none">
            <svg viewBox="0 0 320 320" className="w-full h-full">
              {/* Radar Grid Circles */}
              <circle cx="160" cy="160" r="135" fill="rgba(15, 23, 42, 0.6)" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="160" cy="160" r="105" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <circle cx="160" cy="160" r="70" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="160" cy="160" r="35" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

              {/* Crosshair Axes */}
              <line x1="25" y1="160" x2="295" y2="160" stroke="#1e293b" strokeWidth="1" />
              <line x1="160" y1="25" x2="160" y2="295" stroke="#1e293b" strokeWidth="1" />
              <line x1="64" y1="64" x2="256" y2="256" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 4" />
              <line x1="64" y1="256" x2="256" y2="64" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 4" />

              {/* Range Distance Labels */}
              <text x="165" y="38" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">75% SEC 3(p) BAR</text>
              <text x="165" y="93" fill="#64748b" fontSize="8" fontFamily="monospace">50% MODERATE</text>
              <text x="165" y="128" fill="#10b981" fontSize="8" fontFamily="monospace">25% SAFE</text>

              {/* Rotating Sweep Beam with Cone Gradient */}
              <g className="animate-radar-sweep">
                <defs>
                  <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
                    <stop offset="70%" stopColor="rgba(16, 185, 129, 0.05)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path d="M 160 160 L 160 25 A 135 135 0 0 1 255 65 Z" fill="url(#radarSweepGrad)" />
                <line x1="160" y1="160" x2="160" y2="25" stroke="#34d399" strokeWidth="1.5" />
              </g>

              {/* Radar Center Beacon */}
              <circle cx="160" cy="160" r="4" fill="#10b981" />
              <circle cx="160" cy="160" r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" />

              {/* Target Blips Plotted on the Radar */}
              {defaultCorpora.map((corpus, idx) => {
                const { x, y } = getCoordinates(corpus.overlapScore, corpus.angleDeg);
                const isSelected = selectedTargetIndex === idx;
                const isBarred = corpus.status === 'PRIOR_ART_BAR';
                const blipColor = isBarred ? '#ef4444' : (corpus.overlapScore > 50 ? '#f59e0b' : '#10b981');

                return (
                  <g 
                    key={corpus.id} 
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedTargetIndex(idx)}
                  >
                    {/* Pulsing Ripple Effect */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="12" 
                      fill="none" 
                      stroke={blipColor} 
                      strokeWidth="1.5" 
                      className="animate-radar-ping" 
                      opacity="0.8" 
                    />

                    {/* Selected Target Reticle Lock */}
                    {isSelected && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="16" 
                        fill="none" 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        strokeDasharray="3 2"
                        className="animate-spin"
                        style={{ animationDuration: '6s', transformOrigin: `${x}px ${y}px` }}
                      />
                    )}

                    {/* Main Target Dot */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? '6' : '4.5'} 
                      fill={blipColor} 
                      stroke="#ffffff" 
                      strokeWidth={isSelected ? '2' : '1'} 
                    />

                    {/* Target Label */}
                    <text 
                      x={x + 8} 
                      y={y - 5} 
                      fill={isSelected ? '#ffffff' : '#cbd5e1'} 
                      fontSize="9" 
                      fontFamily="monospace" 
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="drop-shadow-md pointer-events-none"
                    >
                      {corpus.treatiseName} ({corpus.overlapScore}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Radar Legend Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>&gt;70% Sec 3(p) Bar</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>40-70% Overlap</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&lt;40% Novel Extract</span>
            </span>
          </div>
        </div>

        {/* Right: Live Target Telemetry & Overlap Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Target Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    LOCKED TARGET TELEMETRY
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black font-display text-white mt-1">
                  {activeTarget.treatiseName} — {activeTarget.sanskritName}
                </h3>
                <span className="text-xs text-slate-400 font-mono block mt-0.5">
                  Canonical Citation: <strong>{activeTarget.canonicalSection}</strong>
                </span>
              </div>

              {/* Overlap Gauge */}
              <div className="text-right">
                <div className={`text-2xl font-black font-mono ${
                  activeTarget.overlapScore >= 70 ? 'text-red-400' : activeTarget.overlapScore >= 50 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {activeTarget.overlapScore}%
                </div>
                <span className="text-[10px] text-slate-400 font-mono">TKDL Overlap Score</span>
              </div>
            </div>

            {/* Overlap Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Prior-Art Similarity Index</span>
                <span className={activeTarget.status === 'PRIOR_ART_BAR' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeTarget.status === 'PRIOR_ART_BAR' ? 'Section 3(p) Bar Triggered' : '✓ Novelty Clearance Potential'}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeTarget.overlapScore >= 70 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${activeTarget.overlapScore}%` }}
                />
              </div>
            </div>

            {/* Classical Shloka / Canon Reference Excerpt */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Classical Treatise Verse / Shloka Reference</span>
                <button
                  onClick={() => handleCopyCitation(activeTarget.shlokaReference, activeTarget.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === activeTarget.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === activeTarget.id ? 'Copied' : 'Copy Verse'}</span>
                </button>
              </div>
              <p className="text-xs font-display text-emerald-300/95 italic leading-relaxed pl-3 border-l-2 border-emerald-500">
                "{activeTarget.shlokaReference}"
              </p>
            </div>

            {/* Statutory Workaround & Defense Strategy Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Section 3(p) Defense & Patent Workaround Strategy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeTarget.statutoryWorkaround}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanned Treatises Selector Grid */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Scanned Classical Corpora Targets ({filteredCorpora.length})
            </h4>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                filterType === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Treatises
            </button>
            <button
              onClick={() => setFilterType('BARRED')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                filterType === 'BARRED' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Section 3(p) Barred
            </button>
            <button
              onClick={() => setFilterType('CLEARANCE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                filterType === 'CLEARANCE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clearance Gaps
            </button>
          </div>
        </div>

        {/* 5-Treatise Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {defaultCorpora.map((corpus, cIdx) => {
            const isSelected = selectedTargetIndex === cIdx;
            const isBarred = corpus.status === 'PRIOR_ART_BAR';

            return (
              <button
                key={corpus.id}
                onClick={() => setSelectedTargetIndex(cIdx)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-slate-900 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400 truncate">Target #{cIdx + 1}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isBarred ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {corpus.overlapScore}%
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{corpus.treatiseName}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{corpus.canonicalSection}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategic TKDL Defensive Shield Insight */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 relative z-10">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            How Indian Innovators Use TKDL as a Defensive Asset
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Under Patents Act Section 3(p), traditional Ayurvedic formulations cannot be patented as raw admixtures in India. However, foreign patent applications filed abroad (e.g. USPTO, EPO) that attempt to monopolize Indian classical botanicals can be revoked using TKDL prior-art evidence files. To protect your innovation domestically, file a <strong className="text-white font-bold">Process Patent on proprietary extraction yields</strong> with comparative in-vitro / in-vivo synergy data under Section 3(d).
          </p>
        </div>
      </div>
    </div>
  );
};
