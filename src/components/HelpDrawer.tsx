import React, { useState, useEffect } from 'react';
import { 
  X, Search, ShieldCheck, Scale, 
  HelpCircle, ChevronDown, ChevronRight, 
  Lightbulb, Keyboard, Mic, ArrowRight,
  Cpu, Layers
} from 'lucide-react';
import { AntigravityLogo } from './AntigravityLogo';
import { BrandName } from './BrandName';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

type HelpTab = 'workflow' | 'patents' | 'abs' | 'faq' | 'shortcuts';

interface FAQItem {
  question: string;
  answer: string;
  tag: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: 'Why are Ayurvedic formulations frequently rejected under Section 3(p)?',
    answer: 'Section 3(p) of the Indian Patents Act, 1970 explicitly excludes "an invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components." To overcome this, applicants must demonstrate a novel extraction method, an unexpected synergistic ratio (supported by quantitative pharmacological data overcoming Section 3(e)), or a specific non-obvious bio-enhancement (e.g., Piperine bio-availability boosting).',
    tag: 'Patentability'
  },
  {
    question: 'Do Indian AYUSH Vaidyas and MSMEs need NBA approval under BD Act 2023?',
    answer: 'Under the Biological Diversity (Amendment) Act 2023, codified traditional knowledge practitioners (registered AYUSH Vaidyas and Hakims) and cultivated medicinal plant growers are exempt from prior approval/intimation fees when manufacturing Ayurvedic formulations. However, if an Indian company applies for an Intellectual Property Right (Patent), Section 6(1) still mandates obtaining prior approval from the National Biodiversity Authority (NBA Form III) before grant of the patent.',
    tag: 'Biodiversity & ABS'
  },
  {
    question: 'What is the TKDL and how does IP-SAKTI check it?',
    answer: 'The Traditional Knowledge Digital Library (TKDL) contains over 400,000 digitized formulations from classical Sanskrit, Persian, and Tamil texts (Charaka Samhita, Sushruta Samhita, AFI, etc.). IP-SAKTI utilizes high-dimensional semantic embeddings to cross-match user formulations and botanical combinations against these classical prior-art records, providing an overlap percentage and exact historical citation references.',
    tag: 'Prior Art'
  },
  {
    question: 'How do I export a statutory audit report for patent counsel?',
    answer: 'On any completed formulation audit in the Chat Assistant workspace, click the "Export Report" rollout button in the top-right toolbar. You can generate either a high-resolution PDF Executive Summary with legal verdicts and readiness gauges, or a comprehensive Word Document (.docx) statutory dossier containing complete claim draft guidelines and prior art citations.',
    tag: 'Exports'
  },
  {
    question: 'What is WIPO GRATK Treaty 2024 compliance?',
    answer: 'The WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge adopted in May 2024 establishes a mandatory disclosure requirement. Patent applicants worldwide must declare the country of origin of genetic resources and the indigenous/local community providing associated traditional knowledge in their patent specifications.',
    tag: 'International'
  }
];

export const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<HelpTab>('workflow');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFaqs = FAQ_LIST.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <AntigravityLogo size={34} className="shadow-xs" />
              <div>
                <div className="flex items-center gap-2">
                  <BrandName size="sm" />
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    Help & Knowledge Base
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Statutory Guide for Ayurvedic Patentability & Biodiversity Compliance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
              title="Close Help (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:px-5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics: Section 3(p), TKDL, NBA Form III, Synergism..."
                className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-slate-950 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-4 sm:px-5 border-b border-slate-200 overflow-x-auto py-2 bg-slate-50/50 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'workflow'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Workflow & Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('patents')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'patents'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Section 3 Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('abs')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'abs'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BD Act & ABS</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'shortcuts'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 text-xs leading-relaxed">

            {/* TAB 1: WORKFLOW & PIPELINE */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    How the 4-Agent Statutory Pipeline Works
                  </h3>
                  <p className="text-slate-600">
                    IP-SAKTI Sahayak passes your formulation through a sequential multi-agent legal reasoning harness grounded in Indian patent law, TKDL prior art, and the Biological Diversity Act:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-950 mb-0.5">Formulation Ingestion & Botanical Entity Extraction</h4>
                      <p className="text-slate-600">
                        Extracts Sanskrit names, Latin binomials (e.g., <em>Withania somnifera</em>), extraction solvent ratios, and delivery mechanisms from voice or text.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-950 mb-0.5">TKDL Prior Art & Classical Radar</h4>
                      <p className="text-slate-600">
                        Conducts deep vector similarity matching against over 400,000 formulations from the Ayurvedic Formulary of India (AFI), Charaka Samhita, and Sushruta Samhita.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-950 mb-0.5">Statutory Patentability Auditor (Sections 3p, 3d, 3e)</h4>
                      <p className="text-slate-600">
                        Audits claims against non-patentability thresholds under the Indian Patents Act 1970/2024 and international equivalents (USPTO 35 U.S.C. § 101/103, EPO Art 54/56).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-950 mb-0.5">NBA Clearance & Export Readiness Passport</h4>
                      <p className="text-slate-600">
                        Calculates ABS obligations under the BD Act 2023, flags Form I/Form III triggers, and generates a multi-dimensional Readiness Passport.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-blue-900 mb-1">Pro Tip for Formulation Audits</h5>
                    <p className="text-blue-800">
                      Include specific standardized extraction methods (e.g., "aqueous-ethanolic 50:50 extract standardized to 2.5% Withanolides") and synergistic ratios to help the engine evaluate Section 3(d) enhanced therapeutic efficacy and Section 3(e) non-obvious synergistic interactions.
                    </p>
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('assistant');
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Open Assistant & Try Audit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECTION 3 RULES */}
            {activeTab === 'patents' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Indian Patents Act — Section 3 Non-Patentability Bars
                  </h3>
                  <p className="text-slate-600">
                    Understanding the three primary legal barriers that cause 85%+ of Ayurvedic patent rejections at the Indian Patent Office (IPO):
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-extrabold text-slate-950 text-xs">Section 3(p) — Traditional Knowledge Bar</h4>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Strict Exclusion</span>
                    </div>
                    <p className="text-slate-600 mb-2">
                      An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known components is not patentable.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                      <strong>How to Overcome:</strong> Must isolate a specific novel bio-active fraction, create a patentable delivery vehicle (liposomal/nanoparticle), or demonstrate unexpected non-traditional therapeutic utility.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-extrabold text-slate-950 text-xs">Section 3(d) — Enhanced Efficacy Requirement</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Requires Quantitative Data</span>
                    </div>
                    <p className="text-slate-600 mb-2">
                      The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is non-patentable.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                      <strong>How to Overcome:</strong> Must file comparative in-vitro / in-vivo clinical trial evidence proving a statistically significant increase in bio-availability or bio-activity over classical crude extracts.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-extrabold text-slate-950 text-xs">Section 3(e) — Mere Admixture vs. Synergism</h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Combination Rule</span>
                    </div>
                    <p className="text-slate-600 mb-2">
                      A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is non-patentable.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                      <strong>How to Overcome:</strong> Must present Combination Index (CI &lt; 1.0) or isobologram analysis proving true molecular synergism rather than additive summation of individual herbs.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BD ACT & ABS */}
            {activeTab === 'abs' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Biological Diversity Act 2023 & Access and Benefit Sharing (ABS)
                  </h3>
                  <p className="text-slate-600">
                    Mandatory statutory compliance checkpoints under the National Biodiversity Authority (NBA) and State Biodiversity Boards (SBB):
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Section 6(1) — Prior Approval for IPR (Form III)
                    </h4>
                    <p className="text-slate-600 mb-2">
                      No person shall apply for any intellectual property right, in or outside India, for any invention based on any research or information on a biological resource obtained from India without obtaining the prior approval of the National Biodiversity Authority.
                    </p>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                      Applies to all patent applicants before grant
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Section 3(2) — Foreign Entities & Non-Resident Entities (Form I)
                    </h4>
                    <p className="text-slate-600 mb-2">
                      Foreign citizens, non-resident Indians (NRIs), foreign corporations, or Indian entities with foreign shareholding (e.g. FDI-funded wellness startups) must seek NBA Form I clearance prior to accessing Indian biological resources for commercial utilization.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      BD (Amendment) Act 2023 — AYUSH Practitioner Exemption
                    </h4>
                    <p className="text-slate-600">
                      Codified traditional knowledge practitioners (registered AYUSH Vaidyas) and growers of cultivated medicinal plants are exempt from prior intimation and ABS fee collection when utilizing biological resources for classical treatments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Frequently Asked Questions
                  </h3>
                  <p className="text-slate-600">
                    Common questions regarding AYUSH patentability, voice search, exports, and statutory readiness:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {filteredFaqs.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div 
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {faq.tag}
                            </span>
                            <span className="font-bold text-slate-950 text-xs">{faq.question}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-3.5 pt-0 text-slate-600 text-xs border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredFaqs.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No matching topics found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-slate-900" />
                    Keyboard Shortcuts & Quick Actions
                  </h3>
                  <p className="text-slate-600">
                    Streamline your AYUSH patent audit workflow with standard keyboard shortcuts:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">Start New Formulation Audit</h4>
                      <p className="text-slate-500 text-[11px]">Clears active session and resets chat stream</p>
                    </div>
                    <kbd className="font-mono text-[11px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-300 shadow-2xs">
                      Ctrl + N
                    </kbd>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">Submit Formulation Audit Query</h4>
                      <p className="text-slate-500 text-[11px]">Triggers 4-agent statutory pipeline</p>
                    </div>
                    <kbd className="font-mono text-[11px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-300 shadow-2xs">
                      Enter / Ctrl + Enter
                    </kbd>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">Close Drawers & Modals</h4>
                      <p className="text-slate-500 text-[11px]">Closes Help drawer, classifier, or evidence graphs</p>
                    </div>
                    <kbd className="font-mono text-[11px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-300 shadow-2xs">
                      Esc
                    </kbd>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">Voice Dictation</h4>
                      <p className="text-slate-500 text-[11px]">Speak Ayurvedic botanical formulations directly</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-white px-2 py-1 rounded-lg border border-slate-300">
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mic Button</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-2 font-medium">
              <span>Grounded in Indian Patents Act 1970/2024 & BD Act 2023</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
