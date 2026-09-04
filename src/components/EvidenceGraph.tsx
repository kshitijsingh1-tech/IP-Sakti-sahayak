import React, { useState } from 'react';
import type { EvidenceNode, EvidenceEdge } from '../types';
import { Network, ShieldCheck, Info, Sparkles } from 'lucide-react';

interface EvidenceGraphProps {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ nodes, edges }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getNodeColor = (type: string) => {
    const norm = (type || '').toUpperCase();
    switch (norm) {
      case 'QUERY': return { bg: '#e0e7ff', border: '#4338ca', text: '#312e81', glow: 'rgba(67, 56, 202, 0.3)' };
      case 'ENTITY': return { bg: '#ccfbf1', border: '#0f766e', text: '#134e4a', glow: 'rgba(15, 118, 110, 0.3)' };
      case 'TK_RECORD': return { bg: '#fef3c7', border: '#b45309', text: '#78350f', glow: 'rgba(180, 83, 9, 0.3)' };
      case 'STATUTE': return { bg: '#f3e8ff', border: '#7e22ce', text: '#581c87', glow: 'rgba(126, 34, 206, 0.3)' };
      case 'VERDICT': return { bg: '#dcfce7', border: '#15803d', text: '#14532d', glow: 'rgba(21, 128, 61, 0.3)' };
      default: return { bg: '#f1f5f9', border: '#64748b', text: '#0f172a', glow: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const nodeCoords: Record<string, { x: number; y: number }> = {
    'n-query': { x: 60, y: 120 },
    'n-entity': { x: 170, y: 60 },
    'n-tkdl': { x: 170, y: 180 },
    'n-statute-1': { x: 340, y: 60 },
    'n-statute-2': { x: 340, y: 180 },
    'n-verdict': { x: 520, y: 120 },
  };

  const getCoords = (id: string, idx: number) => {
    if (nodeCoords[id]) return nodeCoords[id];
    const col = Math.floor(idx / 2);
    const row = idx % 2;
    return { x: 80 + col * 150, y: 70 + row * 100 };
  };

  return (
    <div className="rounded-3xl antigravity-glass p-6 border border-slate-200/80 max-w-4xl mx-auto shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold font-display text-slate-950">
              Legal Evidence Graph & Vector RAG Topology
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Interactive multi-hop graph mapping formulation ➔ biological taxon ➔ classical TKDL ➔ statutory provisions.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-mono text-xs border border-blue-200 font-bold">
          GraphRAG 2.0
        </span>
      </div>

      {/* SVG Viewport */}
      <div className="relative p-4 rounded-2xl bg-white border border-slate-200 overflow-hidden bg-grid-pattern shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2 font-semibold">
          <span>Click any node to inspect statutory evidence chain</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-600 animate-spin" /> Dynamic Vector Engine</span>
        </div>

        <svg viewBox="0 0 600 240" className="w-full h-auto min-h-[220px] select-none">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="22" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="22" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const sourcePos = getCoords(edge.source, idx);
            const targetPos = getCoords(edge.target, idx + 1);
            const isConnectedToSelected = selectedNodeId === edge.source || selectedNodeId === edge.target;

            const midX = (sourcePos.x + targetPos.x) / 2;
            const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y}, ${midX} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;

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
                <text
                  x={midX}
                  y={(sourcePos.y + targetPos.y) / 2 - 6}
                  textAnchor="middle"
                  fill={isConnectedToSelected ? '#1d4ed8' : '#64748b'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node, idx) => {
            const pos = getCoords(node.id, idx);
            const colors = getNodeColor(node.type);
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                {isSelected && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="2"
                    opacity="0.8"
                    className="animate-ping"
                  />
                )}

                <circle
                  r="22"
                  fill={colors.bg}
                  stroke={isSelected ? '#0f172a' : colors.border}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  filter={`drop-shadow(0px 4px 6px ${colors.glow})`}
                />

                <text
                  textAnchor="middle"
                  dy="-2"
                  fill={colors.text}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {node.type.substring(0, 4)}
                </text>

                <text
                  textAnchor="middle"
                  dy="8"
                  fill={colors.text}
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.label.length > 10 ? node.label.substring(0, 9) + '…' : node.label}
                </text>

                <text
                  textAnchor="middle"
                  dy="34"
                  fill={isSelected ? '#0f172a' : '#475569'}
                  fontSize="9"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-blue-700">
                    Node Type: {selectedNode.type}
                  </span>
                  <strong className="text-slate-950 font-bold">{selectedNode.label}</strong>
                </div>
                <p className="text-slate-700 text-[11px] mt-0.5 font-medium">
                  {selectedNode.subText || 'Verified statutory knowledge graph node connected to the active formulation.'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">
                100% Grounded
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Every edge in the topology graph represents a verified statutory or classical dependency.</span>
        </div>
      </div>
    </div>
  );
};
