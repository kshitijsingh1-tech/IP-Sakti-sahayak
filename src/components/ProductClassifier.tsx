import React, { useState } from 'react';
import type { ProductClassificationResult } from '../types';
import { Layers, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ProductClassifierProps {
  onClassifyComplete: (result: ProductClassificationResult) => void;
}

export const ProductClassifier: React.FC<ProductClassifierProps> = ({ onClassifyComplete }) => {
  const [q1ClassicalText, setQ1ClassicalText] = useState<string | null>(null);
  const [q2Extraction, setQ2Extraction] = useState<string | null>(null);
  const [q3PrimaryUse, setQ3PrimaryUse] = useState<string | null>(null);
  const [q4ClinicalData, setQ4ClinicalData] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);

  const handleReset = () => {
    setQ1ClassicalText(null);
    setQ2Extraction(null);
    setQ3PrimaryUse(null);
    setQ4ClinicalData(null);
    setStep(1);
  };

  const calculateCategory = (): ProductClassificationResult => {
    if (q3PrimaryUse === 'FOOD') {
      return {
        category: 'AYURVEDA_AAHAR',
        title: 'Ayurveda-Aahar (FSSAI Food Regulation)',
        confidence: 96,
        description: 'Designated as a daily health supplement or dietary food under FSSAI Ayurveda-Aahar Regulations 2022.',
        regulatoryBody: 'FSSAI (Food Safety and Standards Authority of India)',
        evidenceRequirements: [
          'Ingredients restricted to Schedule A/B authorized plants',
          'Prohibition on medicinal therapeutic claim (disease cure prohibited)',
          'Heavy metal & microbial safety standards'
        ],
        ipPosture: 'Formulation not patentable if classical components used. Packaging design & brand trademark fully eligible.',
        absPosture: 'Mandatory NBA authorization if biological resources sourced from India for commercial food products.'
      };
    }

    if (q3PrimaryUse === 'COSMETIC') {
      return {
        category: 'COSMETIC',
        title: 'Ayurvedic Cosmetic (D&C Act Schedule S)',
        confidence: 94,
        description: 'Topical beauty, hair or skin application governed under cosmetic provisions of Drugs & Cosmetics Rules.',
        regulatoryBody: 'State AYUSH Licensing Authority',
        evidenceRequirements: [
          'Dermatological safety & non-irritation testing',
          'Heavy metal limits (Lead < 10ppm, Mercury < 1ppm)',
          'Prohibition on therapeutic drug claims on label'
        ],
        ipPosture: 'Formulation patent possible for novel emulsification or delivery method. Brand name & trade dress copyright eligible.',
        absPosture: 'NBA notification required under Biological Diversity Act 2023.'
      };
    }

    if (q1ClassicalText === 'YES') {
      return {
        category: 'CLASSICAL_GENERIC',
        title: 'Classical / Generic Ayurvedic Medicine',
        confidence: 98,
        description: 'Formulation, dosage, and method drawn directly from a First-Schedule authoritative text (e.g. Caraka Samhita, Sharangdhara Samhita).',
        regulatoryBody: 'Ministry of Ayush / State Licensing Authority',
        evidenceRequirements: [
          'Strict compliance with Ayurvedic Pharmacopoeia of India (API) standards',
          'Proof of authentic text citation in SLA application',
          'No clinical safety trial needed if prepared strictly per classical method'
        ],
        ipPosture: 'HIGH PATENT RISK: Barred under Patents Act Sec 3(p) as Traditional Knowledge. Protected defensively via TKDL.',
        absPosture: 'Exempted from NBA benefit sharing for traditional practitioners; NBA approval required for foreign export entities.'
      };
    }

    if (q4ClinicalData === 'YES' && q2Extraction === 'PURIFIED') {
      return {
        category: 'PHYTOPHARMACEUTICAL',
        title: 'Phytopharmaceutical Drug (CDSCO Route)',
        confidence: 95,
        description: 'Purified fraction containing minimum 4 standardized active bioactives derived from medicinal plants.',
        regulatoryBody: 'CDSCO (Central Drugs Standard Control Organization)',
        evidenceRequirements: [
          'Phase I, II & III Clinical Trial Data',
          'Pre-clinical safety & acute/chronic toxicity profile',
          'HPLC/LC-MS standardized bio-marker quantification'
        ],
        ipPosture: 'STRONG PATENT POTENTIAL: Fully eligible for composition of matter and process patents under Indian Patent Office guidelines.',
        absPosture: 'Strict NBA Section 6 pre-approval mandatory before submitting patent application.'
      };
    }

    return {
      category: 'PROPRIETARY_MEDICINE',
      title: 'Patent or Proprietary Medicine (P or P)',
      confidence: 92,
      description: 'Proprietary herbal combination formulated with modern excipients or altered ratios not explicitly found in First Schedule texts.',
      regulatoryBody: 'State AYUSH SLA under D&C Act Rule 158B',
      evidenceRequirements: [
        'Proof of safety & published scientific literature justification',
        'Standardization of active markers',
        'Pilot safety data if non-classical excipients are added'
      ],
      ipPosture: 'CONDITIONAL PATENT: Process patent eligible. Formulation patent requires proof of non-obvious synergistic enhancement under Sec 3(d).',
      absPosture: 'Mandatory NBA clearance prior to commercial launching & IP filings.'
    };
  };

  const finalResult = calculateCategory();

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Ayurvedic Product Regulatory Classifier
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Minimum clarifying questions engine to classify your formulation and determine IP & ABS posture.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-all"
        >
          Reset Classifier
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              step >= i ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Questions Flow */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">Question 1 of 4</span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">
              Is your formulation and preparation method drawn directly from a First-Schedule authoritative text?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              First Schedule texts include Caraka Samhita, Susruta Samhita, Sharangdhara Samhita, Ashtanga Hridaya, etc., specified in the Drugs & Cosmetics Act 1940.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => { setQ1ClassicalText('YES'); setStep(2); }}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between font-bold text-sm text-slate-200 group-hover:text-emerald-300">
                  <span>Yes — Exact Classical Text Formula</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">E.g. Classical Chyawanprash, Triphala Churna, Ashwagandharishta.</p>
              </button>

              <button
                onClick={() => { setQ1ClassicalText('NO'); setStep(2); }}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between font-bold text-sm text-slate-200 group-hover:text-emerald-300">
                  <span>No — Modified / Proprietary / Novel Formula</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">E.g. Standardized capsule, nano-emulsion, modern bioactive blend.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">Question 2 of 4</span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">
              What is the extraction & processing technique used?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              The degree of processing determines whether it falls under traditional AYUSH SLA licensing or CDSCO Phytopharmaceutical route.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => { setQ2Extraction('TRADITIONAL'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Traditional Aqueous / Decoction</span>
                <span className="text-xs text-slate-400">Kwatha, Churna, Asava, Arishta, Taila.</span>
              </button>

              <button
                onClick={() => { setQ2Extraction('STANDARDIZED'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Standardized Solvent Extract</span>
                <span className="text-xs text-slate-400">Hydro-alcoholic extract with quantified active markers (HPLC).</span>
              </button>

              <button
                onClick={() => { setQ2Extraction('PURIFIED'); setStep(3); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Purified Fraction / Isolate</span>
                <span className="text-xs text-slate-400">95%+ purified bioactive fraction with defined chemical structures.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">Question 3 of 4</span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">
              What is the primary intended market category & label claim?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => { setQ3PrimaryUse('MEDICINE'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Medicinal Therapeutic Drug</span>
                <span className="text-xs text-slate-400">Claimed treatment of disease / disorder.</span>
              </button>

              <button
                onClick={() => { setQ3PrimaryUse('FOOD'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Ayurveda-Aahar / Food Supplement</span>
                <span className="text-xs text-slate-400">FSSAI food regulation (non-medicinal claim).</span>
              </button>

              <button
                onClick={() => { setQ3PrimaryUse('COSMETIC'); setStep(4); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block mb-1">Ayurvedic Cosmetic</span>
                <span className="text-xs text-slate-400">Topical beauty, skin & hair care product.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">Question 4 of 4</span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">
              Do you possess human clinical trial data (Phase I-III)?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => { setQ4ClinicalData('YES'); setStep(5); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block">Yes — Clinical Evidence Available</span>
              </button>

              <button
                onClick={() => { setQ4ClinicalData('NO'); setStep(5); }}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <span className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 block">No — Traditional / Pre-clinical Data Only</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Card */}
      {step >= 4 && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40 font-semibold">
                {finalResult.confidence}% Classification Confidence
              </span>
              <span className="text-xs text-slate-400">Regulator: <strong className="text-slate-200">{finalResult.regulatoryBody}</strong></span>
            </div>
            <button
              onClick={() => onClassifyComplete(finalResult)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
            >
              <span>Apply to Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-emerald-300 font-display mb-2">{finalResult.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">{finalResult.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                IP Posture Impact
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{finalResult.ipPosture}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                ABS & Biodiversity Posture
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{finalResult.absPosture}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
