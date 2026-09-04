import React, { useEffect, useState } from 'react';
import type { AgentStep } from '../types';
import { Search, ShieldCheck, AlertTriangle, Target, CheckCircle2, Clock, Loader2, Cpu } from 'lucide-react';

interface AgentPipelineProps {
  steps: AgentStep[];
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ steps }) => {
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(3); // Default to all completed

  useEffect(() => {
    let idx = 0;
    setActiveAgentIndex(0);

    const interval = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        setActiveAgentIndex(idx);
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [steps]);

  const getAgentIcon = (agent: AgentStep['agent']) => {
    switch (agent) {
      case 'RESEARCHER': return Search;
      case 'AUDITOR': return ShieldCheck;
      case 'DEVILS_ADVOCATE': return AlertTriangle;
      case 'STRATEGIST': return Target;
    }
  };

  const getAgentCardStyle = (isRunning: boolean, isDone: boolean) => {
    if (isRunning) return 'border-slate-950 bg-white text-slate-950 shadow-lg ring-2 ring-slate-950 animate-pulse';
    if (!isDone) return 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
    return 'border-slate-200 bg-white text-slate-950 shadow-xs hover:border-slate-400';
  };

  const formatFindingText = (text: string) => {
    if (!text) return '';
    if (text.includes('429 Too Many Requests') || text.includes('LLM unavailable')) {
      return 'Statutory Engine Fallback Active (Rate Limited)';
    }
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return 'Statutory Source Citation Verification';
    }
    if (text.length > 95) {
      return text.substring(0, 95) + '...';
    }
    return text;
  };

  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-lg relative overflow-hidden w-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display text-slate-950 uppercase tracking-wider">
              IP-SAKTI Autonomous Subagent Harness
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Multi-agent reasoning workflow executing parallel statutory audits.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950 text-white font-bold shrink-0">
          {activeAgentIndex === steps.length - 1 ? '✔ 4 Subagents Complete' : `⚡ Running Agent ${activeAgentIndex + 1}/4...`}
        </span>
      </div>

      {/* 4 Agent Cards Grid - Responsive & Bleed Proof */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative w-full">
        {steps.map((step, index) => {
          const Icon = getAgentIcon(step.agent);
          const isDone = index <= activeAgentIndex;
          const isRunning = index === activeAgentIndex && activeAgentIndex < steps.length - 1;

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-w-0 overflow-hidden ${getAgentCardStyle(
                isRunning,
                isDone
              )}`}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-2 gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-slate-950 animate-spin shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-950 shrink-0" />
                    )}
                    <span className="text-xs font-black font-display uppercase tracking-wider text-slate-950 truncate">
                      {step.agent.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 font-semibold shrink-0">
                    <Clock className="w-3 h-3" />
                    {step.timestamp}
                  </span>
                </div>

                <strong className="text-xs font-black block mb-1 text-slate-950 truncate">{step.title}</strong>
                <p className="text-[11px] text-slate-600 mb-3 line-clamp-2 font-medium break-words">{step.details}</p>

                {/* Findings Checklist */}
                {isDone && step.findings && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    {step.findings.map((finding, fIdx) => (
                      <div key={fIdx} className="text-[10px] flex items-start gap-1 text-slate-800 font-medium min-w-0">
                        <CheckCircle2 className="w-3 h-3 text-slate-950 shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-2 min-w-0 flex-1">{formatFindingText(finding)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Footer Badge */}
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono flex items-center justify-between font-bold shrink-0">
                <span className="text-slate-500">Status:</span>
                <span className={isRunning ? 'text-slate-950 animate-pulse font-bold' : isDone ? 'text-slate-950 font-bold' : 'text-slate-400'}>
                  {isRunning ? 'PROCESSING' : isDone ? 'AUDITED & VERIFIED' : 'WAITING'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
