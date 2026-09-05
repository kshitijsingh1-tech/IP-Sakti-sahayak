import React, { useState } from 'react';
import type { EvidenceNode, EvidenceEdge } from '../types';
import { 
  Network, Sparkles, Lightbulb, 
  ChevronRight, ChevronLeft, CheckCircle2
} from 'lucide-react';

interface EvidenceGraphProps {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

interface Grade10Explainer {
  icon: string;
  simpleTitle: string;
  oneLiner: string;
  analogy: string;
  whatComputerDid: string;
  whyItMatters: string;
}

const GRADE_10_EXPLAINERS: Record<string, Grade10Explainer> = {
  'n-query': {
    icon: '💡',
    simpleTitle: 'Step 1: Your Idea (What You Entered)',
    oneLiner: 'This is the recipe, formulation, or question you gave to the AI.',
    analogy: 'Imagine submitting a science fair idea or telling your teacher about a new herbal tea you want to make.',
    whatComputerDid: 'The AI reads every sentence, understanding which ingredients you mentioned and what health claim you are trying to make.',
    whyItMatters: 'Everything in the audit starts from your exact words.'
  },
  'n-entity': {
    icon: '🌿',
    simpleTitle: 'Step 2: The Living Plant (The Natural Herb)',
    oneLiner: 'The computer identified the exact biological plant used in your recipe.',
    analogy: 'Like breaking down a chocolate bar into cocoa, milk, and sugar to see what ingredients are actually inside.',
    whatComputerDid: 'The AI translated common/Ayurvedic names (like Ashwagandha) into official scientific botanical Latin (Withania somnifera) so scientists and patent examiners worldwide know exactly which plant it is.',
    whyItMatters: 'Patent offices reject generic names. You need the exact scientific species to get legal rights.'
  },
  'n-tkdl': {
    icon: '📜',
    simpleTitle: 'Step 3: Ancient Ayurvedic Books (The History Check)',
    oneLiner: 'We checked centuries-old medical books to see if ancient doctors already discovered this remedy.',
    analogy: 'Imagine trying to patent the Pythagorean theorem in math class. Your teacher would say: "Pythagoras proved that 2,500 years ago, you cannot patent it!"',
    whatComputerDid: 'The computer searched over 400,000 ancient Sanskrit and Persian formulas from historic texts (like Charaka Samhita and Sushruta Samhita) to check if your formulation is already recorded.',
    whyItMatters: 'If ancient Ayurvedic doctors already used this herb for this exact cure, it belongs to the whole world (public domain), and you cannot claim you invented it.'
  },
  'n-statute-1': {
    icon: '⚖️',
    simpleTitle: 'Step 4A: The Patent Law Test (Section 3p)',
    oneLiner: 'The law forbids patenting ancient recipes unless you prove a genuine scientific breakthrough.',
    analogy: 'Think of a patent referee. The referee blows the whistle: "You cannot patent plain turmeric milk! Everyone\'s grandma knows that." To get a patent, you have to prove you created something new (like a special nano-delivery method).',
    whatComputerDid: 'Tested your recipe against Section 3(p) and Section 3(d) of the Indian Patents Act, which prevents big companies from stealing traditional knowledge without inventing anything new.',
    whyItMatters: 'This protects Indian heritage while showing real inventors how to legitimately patent a unique scientific improvement.'
  },
  'n-statute-2': {
    icon: '🏛️',
    simpleTitle: 'Step 4B: Biodiversity Permission (National Biodiversity Authority)',
    oneLiner: 'Government rules ensure Indian plants and local communities are respected and protected.',
    analogy: 'Think of India\'s rare medicinal plants like protected national wildlife. Before any company uses them to make commercial profits, they must ask the government permission so nature and local tribes are treated fairly.',
    whatComputerDid: 'Checked Section 6 of the Biological Diversity Act 2023 to verify if your project needs "Form III" approval from the National Biodiversity Authority (NBA) before filing a patent.',
    whyItMatters: 'If you file a patent using Indian herbs without NBA permission, your patent can be cancelled and you could face legal penalties.'
  },
  'n-verdict': {
    icon: '🎯',
    simpleTitle: 'Step 5: The Final Answer & Action Plan',
    oneLiner: 'The final report card: Can you patent it, and what should you do next?',
    analogy: 'Like getting your graded science test back with teacher notes telling you exactly how to turn a B+ into an A+!',
    whatComputerDid: 'Combined the plant data, the ancient history check, and the two legal tests into a single readiness score and step-by-step roadmap.',
    whyItMatters: 'Tells you whether to file a patent, protect your brand name as a trademark, or do more lab tests to prove your formula works better than classical remedies.'
  }
};

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ nodes, edges }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || 'n-query');

  // Ordered list of nodes for step-by-step walkthrough
  const stepOrder = ['n-query', 'n-entity', 'n-tkdl', 'n-statute-1', 'n-statute-2', 'n-verdict'];
  const currentStepIndex = stepOrder.indexOf(selectedNodeId || 'n-query');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const explainer = GRADE_10_EXPLAINERS[selectedNode?.id || 'n-query'] || {
    icon: '🔍',
    simpleTitle: selectedNode?.label || 'Information Node',
    oneLiner: selectedNode?.subText || 'Verified evidence step in the statutory pipeline.',
    analogy: 'A vital clue in the legal evidence puzzle.',
    whatComputerDid: 'Audited this element against national and international IP standards.',
    whyItMatters: 'Ensures the final decision is grounded in verified facts.'
  };

  const handlePrevStep = () => {
    const nextIdx = currentStepIndex > 0 ? currentStepIndex - 1 : stepOrder.length - 1;
    setSelectedNodeId(stepOrder[nextIdx]);
  };

  const handleNextStep = () => {
    const nextIdx = currentStepIndex < stepOrder.length - 1 ? currentStepIndex + 1 : 0;
    setSelectedNodeId(stepOrder[nextIdx]);
  };

  const getNodeColor = (type: string, isSelected: boolean) => {
    const norm = (type || '').toUpperCase();
    switch (norm) {
      case 'QUERY': 
        return { 
          bg: isSelected ? '#3b82f6' : '#eff6ff', 
          border: '#2563eb', 
          text: isSelected ? '#ffffff' : '#1d4ed8', 
          glow: 'rgba(37, 99, 235, 0.4)',
          pillBg: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'ENTITY': 
        return { 
          bg: isSelected ? '#10b981' : '#ecfdf5', 
          border: '#059669', 
          text: isSelected ? '#ffffff' : '#047857', 
          glow: 'rgba(16, 185, 129, 0.4)',
          pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'TK_RECORD': 
        return { 
          bg: isSelected ? '#f59e0b' : '#fffbeb', 
          border: '#d97706', 
          text: isSelected ? '#ffffff' : '#b45309', 
          glow: 'rgba(245, 158, 11, 0.4)',
          pillBg: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'STATUTE': 
        return { 
          bg: isSelected ? '#8b5cf6' : '#f5f3ff', 
          border: '#7c3aed', 
          text: isSelected ? '#ffffff' : '#6d28d9', 
          glow: 'rgba(139, 92, 246, 0.4)',
          pillBg: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'VERDICT': 
        return { 
          bg: isSelected ? '#0f172a' : '#f8fafc', 
          border: '#0f172a', 
          text: isSelected ? '#ffffff' : '#0f172a', 
          glow: 'rgba(15, 23, 42, 0.4)',
          pillBg: 'bg-slate-900 text-white border-slate-950'
        };
      default: 
        return { 
          bg: isSelected ? '#64748b' : '#f1f5f9', 
          border: '#475569', 
          text: isSelected ? '#ffffff' : '#334155', 
          glow: 'rgba(100, 116, 139, 0.4)',
          pillBg: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const nodeCoords: Record<string, { x: number; y: number }> = {
    'n-query': { x: 65, y: 125 },
    'n-entity': { x: 180, y: 65 },
    'n-tkdl': { x: 180, y: 185 },
    'n-statute-1': { x: 355, y: 65 },
    'n-statute-2': { x: 355, y: 185 },
    'n-verdict': { x: 535, y: 125 },
  };

  const getCoords = (id: string, idx: number) => {
    if (nodeCoords[id]) return nodeCoords[id];
    const col = Math.floor(idx / 2);
    const row = idx % 2;
    return { x: 80 + col * 150, y: 70 + row * 100 };
  };

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-5">
      
      {/* Header with Step-by-Step Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-display text-slate-950 flex items-center gap-2">
                <span>Statutory Evidence Graph & Reasoning Chain</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Step-by-step verification linking your formulation to ancient texts (TKDL) and patent eligibility statutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Story Bar — Step-by-Step Navigation */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Trail: Follow the Evidence Chain Left to Right</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevStep}
              className="p-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="text-[11px] font-bold text-slate-500 px-1 font-mono">
              {currentStepIndex + 1} of {stepOrder.length}
            </span>
            <button
              onClick={handleNextStep}
              className="p-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Next Step"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clickable Horizontal Step Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {[
            { id: 'n-query', label: '1. Your Idea', icon: '💡' },
            { id: 'n-entity', label: '2. The Herb', icon: '🌿' },
            { id: 'n-tkdl', label: '3. Ancient Books', icon: '📜' },
            { id: 'n-statute-1', label: '4A. Patent Rule', icon: '⚖️' },
            { id: 'n-statute-2', label: '4B. Govt Permit', icon: '🏛️' },
            { id: 'n-verdict', label: '5. The Verdict', icon: '🎯' },
          ].map((step) => {
            const isCurrent = selectedNodeId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedNodeId(step.id)}
                className={`p-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs scale-102'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="text-sm shrink-0">{step.icon}</span>
                <span className="truncate text-[11px]">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-inner bg-grid-pattern">
        
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
          <span>👆 Click any bubble in the graph to see its simple explanation</span>
          <span className="font-mono text-[10px] text-blue-600 font-bold hidden sm:inline">Left (Input) ➔ Right (Legal Verdict)</span>
        </div>

        <svg viewBox="0 0 600 250" className="w-full h-auto min-h-[220px] select-none">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
            </marker>
          </defs>

          {/* Render Connection Paths (Edges) */}
          {edges.map((edge, idx) => {
            const sourcePos = getCoords(edge.source, idx);
            const targetPos = getCoords(edge.target, idx + 1);
            const isConnectedToSelected = selectedNodeId === edge.source || selectedNodeId === edge.target;

            const midX = (sourcePos.x + targetPos.x) / 2;
            const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y}, ${midX} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
            const displayLabel = edge.label;

            return (
              <g key={idx}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isConnectedToSelected ? '#2563eb' : '#cbd5e1'}
                  strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                  strokeDasharray={isConnectedToSelected ? 'none' : '4,3'}
                  markerEnd={isConnectedToSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                  className="transition-all duration-300"
                />
                
                {/* Edge Label Pill */}
                <rect
                  x={midX - 45}
                  y={(sourcePos.y + targetPos.y) / 2 - 14}
                  width="90"
                  height="14"
                  rx="7"
                  fill={isConnectedToSelected ? '#dbeafe' : '#f8fafc'}
                  stroke={isConnectedToSelected ? '#bfdbfe' : '#e2e8f0'}
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={(sourcePos.y + targetPos.y) / 2 - 4}
                  textAnchor="middle"
                  fill={isConnectedToSelected ? '#1d4ed8' : '#64748b'}
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  className="pointer-events-none"
                >
                  {displayLabel}
                </text>
              </g>
            );
          })}

          {/* Render Bubble Nodes */}
          {nodes.map((node, idx) => {
            const pos = getCoords(node.id, idx);
            const isSelected = selectedNodeId === node.id;
            const colors = getNodeColor(node.type, isSelected);
            const expl = GRADE_10_EXPLAINERS[node.id];

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                {/* Active Ring Animation */}
                {isSelected && (
                  <circle
                    r="32"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="2"
                    opacity="0.8"
                    className="animate-ping"
                  />
                )}

                {/* Main Circle */}
                <circle
                  r="24"
                  fill={colors.bg}
                  stroke={isSelected ? '#0f172a' : colors.border}
                  strokeWidth={isSelected ? '3' : '1.8'}
                  filter={`drop-shadow(0px 4px 6px ${colors.glow})`}
                />

                {/* Center Icon Emoji */}
                <text
                  textAnchor="middle"
                  dy="5"
                  fontSize="16"
                  className="select-none"
                >
                  {expl?.icon || '🔹'}
                </text>

                {/* Subtitle Badge below circle */}
                <text
                  textAnchor="middle"
                  dy="36"
                  fill={isSelected ? '#0f172a' : '#334155'}
                  fontSize="9.5"
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="sans-serif"
                >
                  {node.label.length > 18 ? node.label.substring(0, 17) + '…' : node.label}
                </text>

                {/* Secondary detail text */}
                <text
                  textAnchor="middle"
                  dy="47"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="sans-serif"
                  fontWeight="500"
                >
                  {node.subText ? (node.subText.length > 18 ? node.subText.substring(0, 17) + '…' : node.subText) : node.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Plain-English Explanation Card */}
        {selectedNode && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{explainer.icon}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
                    <span>{explainer.simpleTitle || selectedNode.label}</span>
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {explainer.oneLiner}
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                ✓ Verified Evidence Step
              </span>
            </div>

            {/* Plain-English Practical Analogy Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-extrabold block text-amber-950 mb-0.5">Plain-English Analogy:</strong>
                <p>{explainer.analogy}</p>
              </div>
            </div>

            {/* Behind the Scenes: What the AI Did */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  What the AI Verified
                </span>
                <p className="text-slate-700 font-medium">
                  {explainer.whatComputerDid}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Why It Matters For Your Patent
                </span>
                <p className="text-slate-700 font-medium">
                  {explainer.whyItMatters}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer Clarity Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium pt-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Every connection is verified against real Ayurvedic texts (TKDL) and government patent laws.</span>
        </div>
        <span className="text-slate-400 text-[11px]">Click Next or Prev to step through the story</span>
      </div>

    </div>
  );
};
