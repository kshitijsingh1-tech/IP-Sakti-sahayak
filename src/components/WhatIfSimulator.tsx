import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Ashwagandha', 'Guduchi']);
  const [extractionMethod, setExtractionMethod] = useState<'RAW_POWDER' | 'STANDARDIZED' | 'PURIFIED'>('STANDARDIZED');
  const [therapeuticClaim, setTherapeuticClaim] = useState<'GENERAL' | 'STRESS_STRENGTH' | 'DISEASE_CURE'>('STRESS_STRENGTH');
  const [exportMarket, setExportMarket] = useState<'INDIA' | 'GERMANY_EU' | 'USA'>('GERMANY_EU');

  const availableIngredients = ['Ashwagandha', 'Guduchi', 'Curcumin Extract', 'Brahmi', 'Shatavari', 'Tulsi'];

  const toggleIngredient = (ing: string) => {
    if (ingredients.includes(ing)) {
      if (ingredients.length > 1) {
        setIngredients(ingredients.filter(i => i !== ing));
      }
    } else {
      setIngredients([...ingredients, ing]);
    }
  };

  // Compute live scores based on simulated parameters
  const isRaw = extractionMethod === 'RAW_POWDER';
  const isPurified = extractionMethod === 'PURIFIED';
  const isDiseaseCure = therapeuticClaim === 'DISEASE_CURE';

  let tkRiskScore = isRaw ? 85 : isPurified ? 25 : 60;
  if (ingredients.length > 3) tkRiskScore -= 10;

  let patentScore = isPurified ? 88 : isRaw ? 20 : 62;
  if (isDiseaseCure && isPurified) patentScore += 8;

  let regulatoryDifficulty = exportMarket === 'GERMANY_EU' ? 'HIGH (EU THMPD / Novel Food)' : exportMarket === 'USA' ? 'MEDIUM (FDA Dietary Supplement)' : 'LOW (AYUSH SLA Licence)';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-display text-white">
              IP & Regulatory "What-If" Product Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate how modifying ingredients, extraction techniques, claims, or export markets impacts your IP posture in real-time.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-mono text-xs border border-cyan-500/30">
          Live Recalculation Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters Control Panel */}
        <div className="space-y-5">
          {/* Active Ingredients Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              1. Active Formulation Botanical Ingredients:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableIngredients.map((ing) => {
                const selected = ingredients.includes(ing);
                return (
                  <button
                    key={ing}
                    onClick={() => toggleIngredient(ing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {ing}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extraction Method */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              2. Extraction & Processing Technique:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExtractionMethod('RAW_POWDER')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  isRaw
                    ? 'bg-amber-600 text-white border-amber-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Crude / Raw Churna
              </button>
              <button
                onClick={() => setExtractionMethod('STANDARDIZED')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  extractionMethod === 'STANDARDIZED'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Standardized Extract
              </button>
              <button
                onClick={() => setExtractionMethod('PURIFIED')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  isPurified
                    ? 'bg-cyan-600 text-white border-cyan-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Purified Bioactive
              </button>
            </div>
          </div>

          {/* Therapeutic Claim */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              3. Claimed Therapeutic Indication:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTherapeuticClaim('GENERAL')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  therapeuticClaim === 'GENERAL'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                General Rejuvenative
              </button>
              <button
                onClick={() => setTherapeuticClaim('STRESS_STRENGTH')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  therapeuticClaim === 'STRESS_STRENGTH'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Stress / Adaptogenic
              </button>
              <button
                onClick={() => setTherapeuticClaim('DISEASE_CURE')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  isDiseaseCure
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Specific Clinical Cure
              </button>
            </div>
          </div>

          {/* Target Export Market */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              4. Target Commercial Market:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportMarket('INDIA')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  exportMarket === 'INDIA'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🇮🇳 Domestic India
              </button>
              <button
                onClick={() => setExportMarket('GERMANY_EU')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  exportMarket === 'GERMANY_EU'
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🇩🇪 Germany / EU
              </button>
              <button
                onClick={() => setExportMarket('USA')}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  exportMarket === 'USA'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🇺🇸 United States
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Output Dashboard */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-white mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Simulated IP & Regulatory Profile</span>
              <span className="text-[10px] font-mono text-emerald-400">Live Recalculated</span>
            </h3>

            {/* Patentability vs TK Risk Meters */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Patentability Readiness Score</span>
                  <span className="font-mono font-bold text-emerald-400">{patentScore}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${patentScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Traditional Knowledge (Sec 3p) Risk</span>
                  <span className="font-mono font-bold text-amber-400">{tkRiskScore}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${tkRiskScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Simulated Insights */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Regulatory Entry Friction</span>
                <strong className="text-cyan-300">{regulatoryDifficulty}</strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Recommended IP Protection Route</span>
                <strong className="text-emerald-300">
                  {isPurified ? 'Composition + Process Patent' : isRaw ? 'Trademark Brand + Design Packaging Only' : 'Process Patent on Synergistic Hydro-Extract'}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
            💡 Adjust ingredients or extraction method above to minimize TK overlap and maximize patent readiness.
          </div>
        </div>
      </div>
    </div>
  );
};
