import React, { useState } from 'react';
import type { ProductClassificationResult, AyurvedicCategory } from '../types';
import { Layers, ShieldCheck, Check, RotateCcw, FileText, Send, BookOpen, FlaskConical, Leaf, Pill, SlidersHorizontal, Scale, CheckCircle2, Award } from 'lucide-react';

interface ProductClassifierProps {
  onClassifyComplete: (classification: ProductClassificationResult) => void;
  currentQuery?: string;
  initialCategory?: AyurvedicCategory;
  onSendToChat?: (prompt: string) => void;
}

export const ProductClassifier: React.FC<ProductClassifierProps> = ({
  onClassifyComplete,
  currentQuery,
  initialCategory,
  onSendToChat
}) => {
  // 4 Core Dimensions with initial values derived from current query/category if available
  const [classicalText, setClassicalText] = useState<'YES' | 'NO'>(() => {
    if (initialCategory === 'CLASSICAL_GENERIC') return 'YES';
    return 'NO';
  });
  const [extraction, setExtraction] = useState<'TRADITIONAL' | 'STANDARDIZED' | 'PURIFIED'>(() => {
    if (initialCategory === 'CLASSICAL_GENERIC') return 'TRADITIONAL';
    if (initialCategory === 'PHYTOPHARMACEUTICAL') return 'PURIFIED';
    return 'STANDARDIZED';
  });
  const [primaryUse, setPrimaryUse] = useState<'MEDICINE' | 'FOOD' | 'COSMETIC'>(() => {
    if (initialCategory === 'AYURVEDA_AAHAR') return 'FOOD';
    if (initialCategory === 'COSMETIC') return 'COSMETIC';
    return 'MEDICINE';
  });
  const [clinicalData, setClinicalData] = useState<'YES' | 'NO'>(() => {
    if (initialCategory === 'PHYTOPHARMACEUTICAL') return 'YES';
    return 'NO';
  });

  // Archetype Presets for 1-Click Fast Classification
  const applyPreset = (preset: 'CLASSICAL' | 'PROPRIETARY' | 'AAHAR' | 'PHYTO') => {
    switch (preset) {
      case 'CLASSICAL':
        setClassicalText('YES');
        setExtraction('TRADITIONAL');
        setPrimaryUse('MEDICINE');
        setClinicalData('NO');
        break;
      case 'PROPRIETARY':
        setClassicalText('NO');
        setExtraction('STANDARDIZED');
        setPrimaryUse('MEDICINE');
        setClinicalData('NO');
        break;
      case 'AAHAR':
        setClassicalText('NO');
        setExtraction('STANDARDIZED');
        setPrimaryUse('FOOD');
        setClinicalData('NO');
        break;
      case 'PHYTO':
        setClassicalText('NO');
        setExtraction('PURIFIED');
        setPrimaryUse('MEDICINE');
        setClinicalData('YES');
        break;
    }
  };

  // Live Statutory Calculation
  const calculateResult = (): ProductClassificationResult => {
    const extraConf = clinicalData === 'YES' ? 3 : 0;

    if (classicalText === 'YES' && extraction === 'TRADITIONAL' && primaryUse === 'MEDICINE') {
      return {
        category: 'CLASSICAL_GENERIC',
        title: 'Classical Ayurvedic Medicine (Rule 158-B / SLA Form 25D)',
        regulatoryBody: 'State Licensing Authority (AYUSH SLA) under Rule 158-B',
        ipPosture: 'Section 3(p) Statutory Bar: Raw formulation is in public domain classical texts. Only novel extraction parameters or synergistic delivery methods can seek process patents under Sec 3(d).',
        absPosture: 'Section 40 Exemption applies for local Indian practitioners; Commercial utilization or export requires Form III intimation.',
        description: 'Exact formulation referenced in 1st Schedule texts (Charaka, Sushruta, API). Fast-track manufacturing license granted without clinical trials.',
        evidenceRequirements: ['1st Schedule Classical Text Citation', 'Schedule T GMP Certificate (Form 26E)', 'Raw Material Botanical Authentication'],
        confidence: 98
      };
    }

    if (primaryUse === 'FOOD') {
      return {
        category: 'AYURVEDA_AAHAR',
        title: 'Ayurveda-Aahar (FSSAI Botanical Food Supplement 2022)',
        regulatoryBody: 'Food Safety and Standards Authority of India (FSSAI)',
        ipPosture: 'Composition patent barred under Sec 3(e) unless unexpected synergistic functional dietary efficacy is demonstrated.',
        absPosture: 'Exempted under BD Act Sec 40 if herbs are officially notified normally traded commodities (NTAC).',
        description: 'Botanical dietary supplement regulated under FSSAI Ayurveda-Aahar Regulations 2022. Disease treatment claims strictly prohibited.',
        evidenceRequirements: ['FSSAI Schedule IV Heavy Metal & Pesticide Assay', 'No-Disease-Claim Label Clearance', 'Nutritional Profile Panel'],
        confidence: 92 + extraConf
      };
    }

    if (extraction === 'PURIFIED' || clinicalData === 'YES') {
      return {
        category: 'PHYTOPHARMACEUTICAL',
        title: 'Phytopharmaceutical Drug (CDSCO Rule 122-E)',
        regulatoryBody: 'Central Drugs Standard Control Organization (CDSCO New Drugs Division)',
        ipPosture: 'High Patentability (Product & Process Patents under Sec 2(1)(j)). Equivalent to standard pharmaceutical molecule protection.',
        absPosture: 'Mandatory NBA Form III Prior Approval under Section 6 of Biological Diversity Act 2023.',
        description: 'Purified bioactive fraction with identified chemical markers requiring Phase I-III clinical trial validation.',
        evidenceRequirements: ['Phase I-III Human Clinical Trial Data', 'CDSCO Subject Expert Committee (SEC) Review', 'Structure Elucidation (NMR, LC-MS/MS)'],
        confidence: 91 + extraConf
      };
    }

    // Default Proprietary Medicine
    return {
      category: 'PROPRIETARY_MEDICINE',
      title: 'Proprietary Ayurvedic Medicine (Sec 3(h) / SLA Rule 158-B)',
      regulatoryBody: 'State Licensing Authority (AYUSH SLA) & CDSCO',
      ipPosture: 'Patent Eligible under Sec 3(d) and 3(e) with empirical synergistic bio-efficacy data. Must clear TKDL prior-art citation screening.',
      absPosture: 'Mandatory Access & Benefit Sharing (ABS) compliance & Form III pre-approval if exporting or utilizing proprietary extraction.',
      description: 'Modified classical recipe or novel standardized botanical extract blend. Requires proof of non-obvious synergistic efficacy.',
      evidenceRequirements: ['HPLC Bioactive Fingerprinting & Marker Assay', 'Acute & Sub-acute Safety Toxicity Study', 'NBA Form III Prior Approval'],
      confidence: 95 + extraConf
    };
  };

  const result = calculateResult();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header with Quick Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black font-display text-slate-950 tracking-tight">
                Ayurvedic Regulatory & IP Classifier
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                Instant statutory pathway routing under AYUSH SLA Rule 158-B, CDSCO, or FSSAI.
              </p>
              {currentQuery && (
                <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded shrink-0">
                    Active Formulation
                  </span>
                  <span className="text-slate-800 font-medium leading-relaxed">
                    {currentQuery}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => applyPreset('PROPRIETARY')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all cursor-pointer border border-slate-300 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Statutory Classification Archetype Presets */}
      <div className="space-y-2.5 relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
          <span>Statutory Classification Presets:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset('CLASSICAL')}
            title="Direct classical recipe from 1st Schedule texts (AYUSH Form 25D). Barred under Patents Act Sec 3(p)."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
              classicalText === 'YES' && extraction === 'TRADITIONAL'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/20'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className={`w-3.5 h-3.5 shrink-0 ${classicalText === 'YES' && extraction === 'TRADITIONAL' ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-xs font-bold truncate">Classical Medicine</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">AYUSH SLA Form 25D</span>
          </button>

          <button
            onClick={() => applyPreset('PROPRIETARY')}
            title="Standardized botanical extract blend. Patent eligible under Section 3(d)/3(e) with empirical synergy."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
              classicalText === 'NO' && extraction === 'STANDARDIZED' && primaryUse === 'MEDICINE'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/20'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <FlaskConical className={`w-3.5 h-3.5 shrink-0 ${classicalText === 'NO' && extraction === 'STANDARDIZED' && primaryUse === 'MEDICINE' ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-xs font-bold truncate">Proprietary Extract</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">Patents Act Sec 3(d)/3(e)</span>
          </button>

          <button
            onClick={() => applyPreset('AAHAR')}
            title="Botanical health food supplement under FSSAI 2022 regulations. Disease cure claims strictly prohibited."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
              primaryUse === 'FOOD'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/20'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Leaf className={`w-3.5 h-3.5 shrink-0 ${primaryUse === 'FOOD' ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-xs font-bold truncate">Ayurveda-Aahar</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">FSSAI Regulations 2022</span>
          </button>

          <button
            onClick={() => applyPreset('PHYTO')}
            title="Purified bioactive fraction (>90%) with identified chemical markers and Phase I-III trials under CDSCO Rule 122-E."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
              extraction === 'PURIFIED' && clinicalData === 'YES'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/20'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Pill className={`w-3.5 h-3.5 shrink-0 ${extraction === 'PURIFIED' && clinicalData === 'YES' ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-xs font-bold truncate">Phytopharmaceutical</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">CDSCO Rule 122-E Drug</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Dimension Selectors with Contextual Tooltip Hints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {/* 1. Formula Origin */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 block">
              1. Formulation Source Authority
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Hover for hint</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setClassicalText('YES')}
              title="Direct formulation from First Schedule texts (e.g. Charaka, Sushruta, API). Public domain TKDL prior art."
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                classicalText === 'YES'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Exact 1st Schedule Text
            </button>
            <button
              onClick={() => setClassicalText('NO')}
              title="Novel proprietary formulation, altered ingredient ratio, or modified classical recipe developed in-house."
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                classicalText === 'NO'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Proprietary / Modified
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            First Schedule texts include Caraka, Susruta, Sharangdhara Samhita (Drugs Act).
          </p>
        </div>

        {/* 2. Extraction Technique */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 block">
              2. Extraction & Processing Depth
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Hover for hint</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setExtraction('TRADITIONAL')}
              title="Traditional aqueous decoction (Kwath), raw herbal churna, or classical medicated oil/ghee."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                extraction === 'TRADITIONAL'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Traditional Aqueous
            </button>
            <button
              onClick={() => setExtraction('STANDARDIZED')}
              title="Enriched hydro-alcoholic extract standardized to active chemical markers (HPLC). Enables process patent claims."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                extraction === 'STANDARDIZED'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Standardized (HPLC)
            </button>
            <button
              onClick={() => setExtraction('PURIFIED')}
              title="Purified bioactive fraction (>95% purity), qualifying for CDSCO Phytopharmaceutical drug pipeline."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                extraction === 'PURIFIED'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Purified Isolate
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Standardization enables process patent claims under Section 3(d).
          </p>
        </div>

        {/* 3. Primary Market Claim */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 block">
              3. Intended Market & Label Claim
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Hover for hint</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setPrimaryUse('MEDICINE')}
              title="Indicated for therapeutic mitigation or disease cure. Mandates AYUSH State Licensing Authority or CDSCO drug approval."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                primaryUse === 'MEDICINE'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Therapeutic Drug
            </button>
            <button
              onClick={() => setPrimaryUse('FOOD')}
              title="Marketed as daily botanical dietary supplement under FSSAI Ayurveda-Aahar Regulations 2022. Medicinal claims prohibited."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                primaryUse === 'FOOD'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Food / Aahar
            </button>
            <button
              onClick={() => setPrimaryUse('COSMETIC')}
              title="Formulated for external aesthetic skin, hair, or oral care under Drugs & Cosmetics Rules Part VIII."
              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                primaryUse === 'COSMETIC'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Topical Cosmetic
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Food supplements fall under FSSAI; therapeutic claims mandate AYUSH SLA.
          </p>
        </div>

        {/* 4. Human Clinical Evidence */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 block">
              4. Human Clinical Trial Evidence
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Hover for hint</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setClinicalData('YES')}
              title="Supported by Phase I safety and Phase II/III randomized clinical trials proving therapeutic efficacy."
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                clinicalData === 'YES'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Clinical Data Available
            </button>
            <button
              onClick={() => setClinicalData('NO')}
              title="Supported by classical historical monograph use or in-vitro laboratory studies without human clinical trials."
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                clinicalData === 'NO'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              Pre-Clinical / Traditional
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Clinical trials qualify formulation for Phytopharmaceutical status (CDSCO).
          </p>
        </div>
      </div>

      {/* Uncluttered, Executive Statutory Diagnostic Output Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-sm space-y-5 relative z-10">
        {/* Top Diagnostic Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-bold shadow-xs">
              {result.confidence}% Match Confidence
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>Authority: <strong>{result.regulatoryBody}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onClassifyComplete(result)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply to Current Audit</span>
            </button>

            {onSendToChat && (
              <button
                onClick={() => {
                  const prompt = `Audit statutory patentability for a ${result.title} formulation utilizing standardized botanical extracts in India.`;
                  onSendToChat(prompt);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Send to AI Assistant"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Test in Assistant</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Classification Headline & Context */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h3 className="text-base sm:text-lg font-black font-display text-slate-950 tracking-tight">
              {result.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed pl-4 border-l-2 border-slate-200">
            {result.description}
          </p>
        </div>

        {/* Structured 2-Column Statutory Decision Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card 1: Intellectual Property & Patents Act */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Patents Act 1970/2024 Posture</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                IP Clearance
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {result.ipPosture}
            </p>
          </div>

          {/* Card 2: Biodiversity Act & ABS Compliance */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Biodiversity Act 2023 & ABS</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                NBA Compliance
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {result.absPosture}
            </p>
          </div>
        </div>

        {/* Innovation vs Possible Route Assessment (Patent Claim Analysis) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Scale className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Innovation vs Possible Route Assessment (Patent Claim Support)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Statutory IP Mapping
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/70">
                  <th className="py-2 px-2.5 font-bold">Innovation</th>
                  <th className="py-2 px-2.5 font-bold">Possible Route</th>
                  <th className="py-2 px-2.5 font-bold">Assessment for Patent Claim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Novel formulation/process</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Patent</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-emerald-700">Supports:</strong> Novel standardized extraction or synergistic active ratio overcomes Section 3(d)/3(e) to support patent claims.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Brand name</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">Trademark</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-slate-500">Unsupports Patent Directly:</strong> Brand identity is protected under Trademark Act 1999; commercial branding cannot be claimed within technical patent claims.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Product appearance</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">Design</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-slate-500">Unsupports Patent Directly:</strong> Aesthetic packaging/capsule shape is protected under Designs Act 2000; does not satisfy technical novelty for patent claims.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Geographic origin</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">GI</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-amber-700">Unsupports Patent Monopoly:</strong> Terroir/origin (e.g. Nagori Ashwagandha) is protected via Geographical Indications Act 1999; triggers NBA ABS duties rather than exclusive patent rights.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Confidential manufacturing process</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">Trade secret</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-blue-700">Alternative / Supportive:</strong> Proprietary unpatented extraction parameters can be held as trade secrets without 20-year disclosure, preserving exclusivity.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">New plant variety</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Plant-variety protection</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-slate-500">Unsupports Patent Directly:</strong> Novel botanical varieties are protected under the Protection of Plant Varieties & Farmers' Rights Act 2001 (PPV&FR), not Patents Act.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Original software/content</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">Copyright</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-slate-500">Unsupports Patent Directly:</strong> Educational literature, monographs, and diagnostic algorithms are protected under Copyright Act 1957; does not support formulation patent claims.</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Traditional knowledge</td>
                  <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">Generally defensive protection rather than conventional patenting</span></td>
                  <td className="py-2 px-2.5 text-slate-700 font-medium"><strong className="text-rose-700">Unsupports (Defensive Only):</strong> Pre-existing classical formulations are statutorily barred under Section 3(p); requires documented synergistic enhancement to support patent claims.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Structured Statutory Filing Checklist */}
        <div className="space-y-2.5 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Mandatory Statutory Dossier Requirements:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {result.evidenceRequirements.length} documents required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {result.evidenceRequirements.map((req, rIdx) => (
              <div
                key={rIdx}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
