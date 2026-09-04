import React, { useState } from 'react';
import type { ProductClassificationResult } from '../types';
import { Layers, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ProductClassifierProps {
  onClassifyComplete: (classification: ProductClassificationResult) => void;
}

export const ProductClassifier: React.FC<ProductClassifierProps> = ({ onClassifyComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [q1ClassicalText, setQ1ClassicalText] = useState<'YES' | 'NO' | null>(null);
  const [q2Extraction, setQ2Extraction] = useState<'TRADITIONAL' | 'STANDARDIZED' | 'PURIFIED' | null>(null);
  const [q3PrimaryUse, setQ3PrimaryUse] = useState<'MEDICINE' | 'FOOD' | 'COSMETIC' | null>(null);
  const [q4ClinicalData, setQ4ClinicalData] = useState<'YES' | 'NO' | null>(null);

  const calculateCategory = (): ProductClassificationResult => {
    const extraConf = q4ClinicalData === 'YES' ? 2 : 0;
    if (q1ClassicalText === 'YES' && q2Extraction === 'TRADITIONAL' && q3PrimaryUse === 'MEDICINE') {
      return {
        category: 'CLASSICAL_GENERIC',
        title: 'Classical Ayurvedic Medicine (Ayurvedic SLA 25D)',
        regulatoryBody: 'State Licensing Authority (AYUSH SLA) under Rule 158-B',
        ipPosture: 'Section 3(p) Statutory Bar against patenting raw formulation. Process patents permitted for novel extraction parameters under Sec 3(d).',
        absPosture: 'Mandatory NBA Section 6 filing required if utilizing Indian biological resources for commercial utilization or foreign export.',
        description: 'Formulation cited in 1st Schedule classical texts. Licensed under Form 25D/26D.',
        evidenceRequirements: ['1st Schedule Classical Text Citation', 'GMP Certificate Form 26E', 'Raw Material Authentication'],
        confidence: 98
      };
    }

    if (q2Extraction === 'STANDARDIZED' || q1ClassicalText === 'NO') {
      return {
        category: 'PROPRIETARY_MEDICINE',
        title: 'Proprietary / Non-Classical Ayurvedic Product',
        regulatoryBody: 'AYUSH State Licensing Authority / CDSCO (Sec 3(h) Drugs Act)',
        ipPosture: 'Eligible for Patent Protection (Synergistic combination / Process Patent under Sec 3(d)). Requires TKDL prior-art clearance.',
        absPosture: 'Mandatory Access & Benefit Sharing (ABS) compliance & Form III approval under Biological Diversity Act.',
        description: 'Patentable proprietary extract or synergistic combination with proven therapeutic efficacy.',
        evidenceRequirements: ['HPLC Standardized Bioactive Marker Data', 'Safety Toxicity Report', 'NBA Form III Approval'],
        confidence: 94 + extraConf
      };
    }

    if (q3PrimaryUse === 'FOOD') {
      return {
        category: 'AYURVEDA_AAHAR',
        title: 'Ayurveda-Aahar (FSSAI Botanical Food Supplement)',
        regulatoryBody: 'Food Safety and Standards Authority of India (FSSAI Regulations 2022)',
        ipPosture: 'Formulation patent barred under Sec 3(e) unless unexpected synergistic functional food efficacy is established.',
        absPosture: 'Exempted under BD Act Sec 40 if biological resource is traded as a commodity.',
        description: 'Food supplement regulated under Ayurveda-Aahar safety and labeling standards.',
        evidenceRequirements: ['FSSAI Schedule IV Safety Test', 'Label Claim Clearance', 'Heavy Metal & Pesticide Assay'],
        confidence: 91 + extraConf
      };
    }

    return {
      category: 'PHYTOPHARMACEUTICAL',
      title: 'Phytopharmaceutical Drug (CDSCO New Drug Route)',
      regulatoryBody: 'Central Drugs Standard Control Organization (CDSCO Rule 122E)',
      ipPosture: 'Full Patentability (Product & Process Patent). Equivalent to small-molecule pharmaceutical IP protection.',
      absPosture: 'NBA Form III Prior Approval mandatory for all commercial extraction and R&D.',
      description: 'Purified botanical fraction requiring Phase I-III clinical trial validation.',
      evidenceRequirements: ['Phase I-III Clinical Trial Data', 'CDSCO SEC Panel Review', 'Structure Elucidation (NMR/MS)'],
      confidence: 89 + extraConf
    };
  };

  const handleReset = () => {
    setStep(1);
    setQ1ClassicalText(null);
    setQ2Extraction(null);
    setQ3PrimaryUse(null);
    setQ4ClinicalData(null);
  };

  const finalResult = calculateCategory();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-slate-950 space-y-6 w-full relative overflow-hidden">
      {/* Google 4-Color Ambient Rainbow Halo Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-950" />
            <h2 className="text-lg font-bold font-display text-slate-950">
              Ayurvedic Product Regulatory Classifier
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Minimum clarifying questions engine to classify your formulation and determine IP & ABS posture.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-950 border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
        >
          Reset Classifier
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              step >= i ? 'bg-slate-950' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Questions Flow */}
      {step === 1 && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">Question 1 of 4</span>
            <h3 className="text-base font-bold text-slate-950 mt-1 mb-2">
              Is your formulation and preparation method drawn directly from a First-Schedule authoritative text?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              First Schedule texts include Caraka Samhita, Susruta Samhita, Sharangdhara Samhita, Ashtanga Hridaya, etc., specified in the Drugs & Cosmetics Act 1940.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => { setQ1ClassicalText('YES'); setStep(2); }}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center justify-between font-bold text-sm text-slate-950 relative z-10">
                  <span>Yes — Exact Classical Text Formula</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-600 mt-1 relative z-10">E.g. Classical Chyawanprash, Triphala Churna, Ashwagandharishta.</p>
              </button>

              <button
                onClick={() => { setQ1ClassicalText('NO'); setStep(2); }}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center justify-between font-bold text-sm text-slate-950 relative z-10">
                  <span>No — Modified / Proprietary / Novel Formula</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-600 mt-1 relative z-10">E.g. Standardized capsule, nano-emulsion, modern bioactive blend.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">Question 2 of 4</span>
            <h3 className="text-base font-bold text-slate-950 mt-1 mb-2">
              What is the extraction & processing technique used?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              The degree of processing determines whether it falls under traditional AYUSH SLA licensing or CDSCO Phytopharmaceutical route.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => { setQ2Extraction('TRADITIONAL'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Traditional Aqueous / Decoction</span>
                <span className="text-xs text-slate-600 relative z-10">Kwatha, Churna, Asava, Arishta, Taila.</span>
              </button>

              <button
                onClick={() => { setQ2Extraction('STANDARDIZED'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Standardized Solvent Extract</span>
                <span className="text-xs text-slate-600 relative z-10">Hydro-alcoholic extract with quantified active markers (HPLC).</span>
              </button>

              <button
                onClick={() => { setQ2Extraction('PURIFIED'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Purified Fraction / Isolate</span>
                <span className="text-xs text-slate-600 relative z-10">95%+ purified bioactive fraction with defined chemical structures.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">Question 3 of 4</span>
            <h3 className="text-base font-bold text-slate-950 mt-1 mb-2">
              What is the primary intended market category & label claim?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => { setQ3PrimaryUse('MEDICINE'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Medicinal Therapeutic Drug</span>
                <span className="text-xs text-slate-600 relative z-10">Claimed treatment of disease / disorder.</span>
              </button>

              <button
                onClick={() => { setQ3PrimaryUse('FOOD'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Ayurveda-Aahar / Food Supplement</span>
                <span className="text-xs text-slate-600 relative z-10">FSSAI food regulation (non-medicinal claim).</span>
              </button>

              <button
                onClick={() => { setQ3PrimaryUse('COSMETIC'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block mb-1 relative z-10">Ayurvedic Cosmetic</span>
                <span className="text-xs text-slate-600 relative z-10">Topical beauty, skin & hair care product.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono text-slate-950 font-bold uppercase tracking-wider">Question 4 of 4</span>
            <h3 className="text-base font-bold text-slate-950 mt-1 mb-2">
              Do you possess human clinical trial data (Phase I-III)?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => { setQ4ClinicalData('YES'); setStep(5); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block relative z-10">Yes — Clinical Evidence Available</span>
              </button>

              <button
                onClick={() => { setQ4ClinicalData('NO'); setStep(5); }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-left transition-all relative overflow-hidden group cursor-pointer shadow-xs"
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <span className="font-bold text-sm text-slate-950 block relative z-10">No — Traditional / Pre-clinical Data Only</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Card */}
      {step >= 4 && (
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden group hover:border-slate-400 hover:shadow-md transition-all">
          {/* Google Rainbow Hover Halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-950 font-mono text-xs border border-slate-300 font-bold">
                {finalResult.confidence}% Classification Confidence
              </span>
              <span className="text-xs text-slate-600">Regulator: <strong className="text-slate-950 font-bold">{finalResult.regulatoryBody}</strong></span>
            </div>
            <button
              onClick={() => onClassifyComplete(finalResult)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-slate-950"
            >
              <span>Apply to Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-slate-950 font-display mb-2 relative z-10">{finalResult.title}</h3>
          <p className="text-xs text-slate-700 leading-relaxed mb-4 relative z-10">{finalResult.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                IP Posture Impact
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{finalResult.ipPosture}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-slate-950" />
                ABS & Biodiversity Posture
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{finalResult.absPosture}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
