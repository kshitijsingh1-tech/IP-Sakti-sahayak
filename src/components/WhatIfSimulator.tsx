import React, { useState } from 'react';
import { Sliders, Plus, X, Send, RotateCcw, Check, ShieldCheck, FileCheck, Award, BookOpen, Globe } from 'lucide-react';

interface WhatIfSimulatorProps {
  activeQuery?: string;
  onSendToChat?: (prompt: string) => void;
  onClose?: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  activeQuery,
  onSendToChat,
  onClose
}) => {
  // Formulation State
  const [ingredients, setIngredients] = useState<string[]>(() => {
    if (activeQuery) {
      const lower = activeQuery.toLowerCase();
      const detected: string[] = [];
      if (lower.includes('ashwagandha')) detected.push('Ashwagandha');
      if (lower.includes('piperine') || lower.includes('pepper') || lower.includes('maricha')) detected.push('Piperine');
      if (lower.includes('curcumin') || lower.includes('turmeric') || lower.includes('haridra')) detected.push('Curcumin');
      if (lower.includes('guduchi') || lower.includes('giloy')) detected.push('Guduchi');
      if (lower.includes('tulsi')) detected.push('Tulsi');
      if (detected.length > 0) return detected;
    }
    return ['Ashwagandha', 'Piperine'];
  });

  const [customHerbInput, setCustomHerbInput] = useState('');
  const [extractionMethod, setExtractionMethod] = useState<'RAW_POWDER' | 'STANDARDIZED' | 'PURIFIED'>('STANDARDIZED');
  const [therapeuticClaim, setTherapeuticClaim] = useState<'GENERAL' | 'STRESS_STRENGTH' | 'DISEASE_CURE'>('STRESS_STRENGTH');
  const [exportMarket, setExportMarket] = useState<'INDIA' | 'GERMANY_EU' | 'USA'>('INDIA');

  const popularBotanicals = [
    'Ashwagandha', 'Curcumin', 'Piperine', 'Guduchi', 
    'Tulsi', 'Shatavari', 'Brahmi', 'Amalaki', 'Triphala', 'Neem'
  ];

  // 1-Click Optimization Presets
  const applyPreset = (preset: 'MAX_PATENT' | 'TRADITIONAL_FAST' | 'GLOBAL_EXPORT') => {
    switch (preset) {
      case 'MAX_PATENT':
        setIngredients(['Curcumin', 'Piperine', 'Ashwagandha']);
        setExtractionMethod('STANDARDIZED');
        setTherapeuticClaim('DISEASE_CURE');
        setExportMarket('USA');
        break;
      case 'TRADITIONAL_FAST':
        setIngredients(['Ashwagandha', 'Amalaki']);
        setExtractionMethod('RAW_POWDER');
        setTherapeuticClaim('GENERAL');
        setExportMarket('INDIA');
        break;
      case 'GLOBAL_EXPORT':
        setIngredients(['Ashwagandha', 'Guduchi']);
        setExtractionMethod('STANDARDIZED');
        setTherapeuticClaim('STRESS_STRENGTH');
        setExportMarket('GERMANY_EU');
        break;
    }
  };

  const addIngredient = (ing: string) => {
    const trimmed = ing.trim();
    if (!trimmed) return;
    if (!ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients(prev => [...prev, trimmed]);
    }
    setCustomHerbInput('');
  };

  const removeIngredient = (ing: string) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter(i => i !== ing));
    }
  };

  // Real-time IP & Statutory Calculation
  const isRaw = extractionMethod === 'RAW_POWDER';
  const isPurified = extractionMethod === 'PURIFIED';
  const isDiseaseCure = therapeuticClaim === 'DISEASE_CURE';

  let patentScore = 35;
  if (extractionMethod === 'STANDARDIZED') patentScore += 35;
  if (extractionMethod === 'PURIFIED') patentScore += 50;
  if (ingredients.length >= 2) patentScore += 10; // Section 3(e) Synergistic Combination bonus
  if (isDiseaseCure) patentScore += 5;
  if (patentScore > 96) patentScore = 96;

  let tkRiskScore = 85;
  if (isRaw) tkRiskScore = 90;
  if (extractionMethod === 'STANDARDIZED') tkRiskScore = 40;
  if (isPurified) tkRiskScore = 15;

  let regulatoryFriction = 'LOW — State Licensing Authority SLA Form 25D';
  if (exportMarket === 'GERMANY_EU') regulatoryFriction = 'HIGH — EU Novel Food / THMPD Registration';
  if (exportMarket === 'USA') regulatoryFriction = 'MEDIUM — FDA DSHEA Dietary Supplement NDI';

  let recommendedRoute = 'Process Patent on Synergistic Hydro-Extract (Sec 3(d)/3(e))';
  if (isPurified) recommendedRoute = 'Phytopharmaceutical Composition + Process Patent (CDSCO Rule 122-E)';
  if (isRaw) recommendedRoute = 'Trademark Brand + Design Packaging (Statutorily Barred under Sec 3(p))';

  let synergyNote = '';
  if (ingredients.length >= 2) {
    synergyNote = `Multi-botanical combination (${ingredients.join(' + ')}) qualifies for Section 3(e) synergy exemption with verified non-obvious bio-efficacy data.`;
  } else {
    synergyNote = 'Single-herb formulation carries higher vulnerability to Section 3(p) prior art anticipation.';
  }

  const generatedPrompt = `Evaluate patentability and ABS compliance for a ${
    isPurified ? 'purified isolate' : isRaw ? 'crude churna' : 'standardized extract'
  } of ${ingredients.join(' and ')} indicated for ${
    therapeuticClaim === 'DISEASE_CURE' ? 'targeted clinical disease management' : therapeuticClaim === 'STRESS_STRENGTH' ? 'adaptogenic stress resilience' : 'general rejuvenation'
  } in ${exportMarket === 'GERMANY_EU' ? 'Germany / European Union' : exportMarket === 'USA' ? 'United States' : 'India'}.`;

  return (
    <div className="bg-white text-slate-950 space-y-6 w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sliders className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black font-display text-slate-950 tracking-tight">
              IP & Regulatory "What-If" Simulator
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Live simulation: Alter botanicals, extraction depth, and markets to inspect patent viability in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => applyPreset('MAX_PATENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all cursor-pointer border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all cursor-pointer border border-slate-300"
              title="Close Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Statutory Optimization Profiles */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-slate-700" />
          <span>Statutory Optimization Profiles:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => applyPreset('MAX_PATENT')}
            title="Optimizes formulation for highest patentability: Curcumin + Piperine standardized extract exported to US/EPO under Section 3(d)/3(e) synergy."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              extractionMethod === 'STANDARDIZED' && exportMarket === 'USA' && ingredients.includes('Curcumin')
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold truncate">Maximum Patentability</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                85%+ Score
              </span>
            </div>
            <p className="text-[10px] opacity-80 mt-1 leading-snug">Curcumin + Piperine standardized synergy</p>
          </button>

          <button
            onClick={() => applyPreset('TRADITIONAL_FAST')}
            title="Rapid domestic AYUSH SLA manufacturing license path. Traditional raw churna without patent claims."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              isRaw && exportMarket === 'INDIA'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold truncate">Classical SLA Licensing</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
                30-Day SLA
              </span>
            </div>
            <p className="text-[10px] opacity-80 mt-1 leading-snug">Raw churna classical license route</p>
          </button>

          <button
            onClick={() => applyPreset('GLOBAL_EXPORT')}
            title="International export clearance route: Requires National Biodiversity Authority (NBA) Section 6 approval."
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              exportMarket === 'GERMANY_EU'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-xs font-bold truncate">Global Export Clearance</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
                NBA Sec 6
              </span>
            </div>
            <p className="text-[10px] opacity-80 mt-1 leading-snug">Novel food & ABS clearance compliance</p>
          </button>
        </div>
      </div>

      {/* Main Parameters Configuration Grid */}
      <div className="space-y-4">
        {/* 1. Active Ingredients Selector */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
              <span>1. Active Botanical Ingredients</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 font-bold">
                {ingredients.length} Selected
              </span>
            </label>

            {ingredients.length >= 2 && (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <Check className="w-3 h-3 text-emerald-600" /> Sec 3(e) Synergistic Multiplier Active
              </span>
            )}
          </div>

          {/* Selected Tag Chips */}
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map(ing => (
              <span
                key={ing}
                className="px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>{ing}</span>
                <button
                  onClick={() => removeIngredient(ing)}
                  className="hover:text-red-400 cursor-pointer p-0.5"
                  title={`Remove ${ing}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Custom Herb Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customHerbInput}
              onChange={(e) => setCustomHerbInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIngredient(customHerbInput);
                }
              }}
              placeholder="Type custom botanical (e.g. Shankhpushpi, Neem)..."
              className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-950 focus:outline-none focus:border-slate-950 font-medium"
            />
            <button
              onClick={() => addIngredient(customHerbInput)}
              disabled={!customHerbInput.trim()}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Popular Botanical Chips */}
          <div>
            <span className="text-[11px] text-slate-600 font-semibold block mb-2">Standard Ayurvedic Botanicals:</span>
            <div className="flex flex-wrap gap-1.5">
              {popularBotanicals.map(bot => {
                const isAdded = ingredients.some(i => i.toLowerCase() === bot.toLowerCase());
                return (
                  <button
                    key={bot}
                    onClick={() => isAdded ? removeIngredient(bot) : addIngredient(bot)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-slate-950 text-white border-slate-950 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-950'
                    }`}
                  >
                    {isAdded ? `✓ ${bot}` : `+ ${bot}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Extraction Depth */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <label className="text-xs font-bold text-slate-950 block">
            2. Extraction & Processing Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setExtractionMethod('RAW_POWDER')}
              title="Raw pulverized botanical powder. Statutorily barred from composition patenting under Indian Patents Act Section 3(p)."
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                isRaw
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
              }`}
            >
              <span className="block text-xs font-bold truncate">Crude Churna</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">Raw botanical powder</span>
            </button>

            <button
              onClick={() => setExtractionMethod('STANDARDIZED')}
              title="Solvent extraction standardized against quantified active chemical markers (HPLC). Enables Section 3(d)/3(e) process patent protection."
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                extractionMethod === 'STANDARDIZED'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
              }`}
            >
              <span className="block text-xs font-bold truncate">Standardized Extract</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">HPLC active markers</span>
            </button>

            <button
              onClick={() => setExtractionMethod('PURIFIED')}
              title="Purified bioactive chemical fraction (>95% purity). Qualifies for CDSCO Rule 122-E Phytopharmaceutical new drug route."
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                isPurified
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
              }`}
            >
              <span className="block text-xs font-bold truncate">Purified Isolate</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">95%+ chemical fraction</span>
            </button>
          </div>
        </div>

        {/* 3 & 4. Indication & Jurisdiction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Indication */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="text-xs font-bold text-slate-950 block">
              3. Claimed Indication
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'GENERAL', label: 'General Rejuvenation (Rasayana)', hint: 'Traditional rasayana wellness supplement. Section 3(p) prior art anticipation applies.' },
                { id: 'STRESS_STRENGTH', label: 'Adaptogenic / Stress Shield', hint: 'Functional stress adaptogen claim. Requires non-obvious synergy evidence under Section 3(e).' },
                { id: 'DISEASE_CURE', label: 'Targeted Clinical Disease Treatment', hint: 'Specific disease mitigation or cure claim. Mandates CDSCO Phase I-III clinical trial dossier.' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setTherapeuticClaim(item.id as any)}
                  title={item.hint}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    therapeuticClaim === item.id
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Export Market */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="text-xs font-bold text-slate-950 block">
              4. Target Market & Regulation
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'INDIA', label: 'India Domestic (AYUSH SLA Form 25D)', hint: 'Governed by Indian Patents Act 1970/2024 & Biological Diversity Act 2023 Section 40 exemption.' },
                { id: 'USA', label: 'United States (US FDA NDI / DSHEA)', hint: 'USPTO 35 U.S.C. § 101/103 patentability and US FDA DSHEA / Botanical IND guidance.' },
                { id: 'GERMANY_EU', label: 'European Union / Germany (EMA THMPD)', hint: 'European Patent Office (EPO Art 52/53) and EMA Traditional Herbal Medicinal Products Directive.' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setExportMarket(item.id as any)}
                  title={item.hint}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    exportMarket === item.id
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Simulation Dashboard — Light Themed to Match Application Design */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black font-display uppercase tracking-wider text-slate-950">
              Live Simulated Statutory Profile
            </h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 font-bold">
            {isPurified ? 'Phytopharmaceutical' : isRaw ? 'Crude Churna' : 'Standardized Extract'}
          </span>
        </div>

        {/* Dual Meters: Patent Readiness vs Section 3(p) TK Risk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-bold">Patentability Readiness</span>
              <span className="font-bold text-base text-emerald-600">{patentScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${patentScore}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {patentScore >= 70 ? 'High Patent Feasibility (Section 3(d) / 3(e))' : 'High Prior Art Anticipation Barrier'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 font-bold">Sec 3(p) TKDL Bar Risk</span>
              <span className={`font-bold text-base ${tkRiskScore > 60 ? 'text-rose-600' : 'text-amber-600'}`}>
                {tkRiskScore}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${tkRiskScore > 60 ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${tkRiskScore}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {tkRiskScore > 60 ? 'Classical public domain text exclusion' : 'Cleared via standardized extraction'}
            </span>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Statutory IP Route:</span>
            </span>
            <strong className="text-slate-950 font-bold block leading-snug">
              {recommendedRoute}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Regulatory Compliance Burden:</span>
            </span>
            <span className="text-slate-800 block font-semibold leading-snug">
              {regulatoryFriction}
            </span>
          </div>
        </div>

        {/* Synergy Note Banner */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-950 font-medium flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span><strong className="font-bold">Synergy Formulation Analysis:</strong> {synergyNote}</span>
        </div>

        {/* Trigger Full Audit Button */}
        {onSendToChat && (
          <div className="pt-2">
            <button
              onClick={() => onSendToChat(generatedPrompt)}
              className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group"
            >
              <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              <span>Run 4-Agent AI Audit on this Simulated Formula</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
