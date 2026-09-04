import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Ashwagandha', 'Guduchi']);
  const [extractionMethod, setExtractionMethod] = useState<'RAW_POWDER' | 'STANDARDIZED' | 'PURIFIED'>('STANDARDIZED');
  const [therapeuticClaim, setTherapeuticClaim] = useState<'GENERAL' | 'STRESS_STRENGTH' | 'DISEASE_CURE'>('STRESS_STRENGTH');
  const [exportMarket, setExportMarket] = useState<'INDIA' | 'GERMANY_EU' | 'USA'>('INDIA');

  const availableIngredients = ['Ashwagandha', 'Guduchi', 'Tulsi', 'Amalaki', 'Shatavari', 'Curcumin'];

  const toggleIngredient = (ing: string) => {
    if (ingredients.includes(ing)) {
      if (ingredients.length > 1) {
        setIngredients(ingredients.filter(i => i !== ing));
      }
    } else {
      setIngredients([...ingredients, ing]);
    }
  };

  const isRaw = extractionMethod === 'RAW_POWDER';
  const isPurified = extractionMethod === 'PURIFIED';
  const isDiseaseCure = therapeuticClaim === 'DISEASE_CURE';

  let patentScore = 40;
  if (extractionMethod === 'STANDARDIZED') patentScore += 30;
  if (extractionMethod === 'PURIFIED') patentScore += 45;
  if (ingredients.length >= 3) patentScore += 10;
  if (patentScore > 95) patentScore = 95;

  let tkRiskScore = 80;
  if (isRaw) tkRiskScore = 90;
  if (extractionMethod === 'STANDARDIZED') tkRiskScore = 45;
  if (isPurified) tkRiskScore = 20;

  let regulatoryDifficulty = exportMarket === 'GERMANY_EU' ? 'HIGH (EU THMPD / Novel Food)' : exportMarket === 'USA' ? 'MEDIUM (FDA Dietary Supplement)' : 'LOW (AYUSH SLA Licence)';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Halo Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-bold font-display text-slate-950">
              IP & Regulatory "What-If" Product Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulate how modifying ingredients, extraction techniques, claims, or export markets impacts your IP posture in real-time.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-950 font-mono text-xs border border-slate-300 font-bold">
          Live Recalculation Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Input Parameters Control Panel */}
        <div className="space-y-5">
          {/* Active Ingredients Selector */}
          <div>
            <label className="text-xs font-bold text-slate-950 block mb-2">
              1. Active Formulation Botanical Ingredients:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableIngredients.map((ing) => {
                const selected = ingredients.includes(ing);
                return (
                  <button
                    key={ing}
                    onClick={() => toggleIngredient(ing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer relative overflow-hidden group ${
                      selected
                        ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    {!selected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    )}
                    <span className="relative z-10">{selected ? '✓ ' : '+ '} {ing}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extraction Method */}
          <div>
            <label className="text-xs font-bold text-slate-950 block mb-2">
              2. Extraction & Processing Technique:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExtractionMethod('RAW_POWDER')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isRaw
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {!isRaw && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">Crude / Raw Churna</span>
              </button>
              <button
                onClick={() => setExtractionMethod('STANDARDIZED')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  extractionMethod === 'STANDARDIZED'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {extractionMethod !== 'STANDARDIZED' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">Standardized Extract</span>
              </button>
              <button
                onClick={() => setExtractionMethod('PURIFIED')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isPurified
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {!isPurified && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">Purified Bioactive</span>
              </button>
            </div>
          </div>

          {/* Therapeutic Claim */}
          <div>
            <label className="text-xs font-bold text-slate-950 block mb-2">
              3. Claimed Therapeutic Indication:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTherapeuticClaim('GENERAL')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  therapeuticClaim === 'GENERAL'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {therapeuticClaim !== 'GENERAL' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">General Rejuvenative</span>
              </button>
              <button
                onClick={() => setTherapeuticClaim('STRESS_STRENGTH')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  therapeuticClaim === 'STRESS_STRENGTH'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {therapeuticClaim !== 'STRESS_STRENGTH' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">Stress / Adaptogenic</span>
              </button>
              <button
                onClick={() => setTherapeuticClaim('DISEASE_CURE')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isDiseaseCure
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {!isDiseaseCure && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">Specific Clinical Cure</span>
              </button>
            </div>
          </div>

          {/* Target Export Market */}
          <div>
            <label className="text-xs font-bold text-slate-950 block mb-2">
              4. Target Commercial Market:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportMarket('INDIA')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  exportMarket === 'INDIA'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {exportMarket !== 'INDIA' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">🇮🇳 Domestic India</span>
              </button>
              <button
                onClick={() => setExportMarket('GERMANY_EU')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  exportMarket === 'GERMANY_EU'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {exportMarket !== 'GERMANY_EU' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">🇩🇪 Germany / EU</span>
              </button>
              <button
                onClick={() => setExportMarket('USA')}
                className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer relative overflow-hidden group ${
                  exportMarket === 'USA'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {exportMarket !== 'USA' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                <span className="relative z-10">🇺🇸 United States</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Output Dashboard */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
          {/* Google Rainbow Hover Halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-sm font-bold font-display text-slate-950 mb-4 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Simulated IP & Regulatory Profile</span>
              <span className="text-[10px] font-mono text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">Live Recalculated</span>
            </h3>

            {/* Patentability vs TK Risk Meters */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-bold">Patentability Readiness Score</span>
                  <span className="font-mono font-bold text-slate-950">{patentScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-slate-950 transition-all duration-500"
                    style={{ width: `${patentScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-bold">Traditional Knowledge (Sec 3p) Risk</span>
                  <span className="font-mono font-bold text-slate-950">{tkRiskScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-slate-950 transition-all duration-500"
                    style={{ width: `${tkRiskScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Simulated Insights */}
            <div className="space-y-2.5 text-xs text-slate-800">
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-mono">Regulatory Entry Friction</span>
                <strong className="text-slate-950 font-bold block mt-0.5">{regulatoryDifficulty}</strong>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-mono">Recommended IP Protection Route</span>
                <strong className="text-slate-950 font-bold block mt-0.5">
                  {isPurified ? 'Composition + Process Patent' : isRaw ? 'Trademark Brand + Design Packaging Only' : 'Process Patent on Synergistic Hydro-Extract'}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-medium relative z-10">
            💡 Adjust ingredients or extraction method above to minimize TK overlap and maximize patent readiness.
          </div>
        </div>
      </div>
    </div>
  );
};
