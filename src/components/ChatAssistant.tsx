import React, { useState } from 'react';
import type { QueryResult, Jurisdiction, AuditHistoryItem, SampleQuery } from '../types';
import { SAMPLE_QUERIES, getMockAnalysisForQuery } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { analyzeQuery, mapBackendResponseToQueryResult } from '../services/aiEngine';
import { triggerGoogleTranslate } from '../services/translator';
import { EvidenceGraph } from './EvidenceGraph';
import { AntigravityLogo } from './AntigravityLogo';
import { BrandName } from './BrandName';
import { FileUploadTrigger, FileChipsList, type UploadedFile } from './FileUploadButton';
import { ProductClassifier } from './ProductClassifier';
import { TKDLRadar } from './TKDLRadar';
import { ABSChecker } from './ABSChecker';
import { WhatIfSimulator } from './WhatIfSimulator';
import { ReadinessPassport } from './ReadinessPassport';
import { ArchitectureView } from './ArchitectureView';
import { ExportRolloutButton } from './ExportRolloutButton';
import { VoiceInputButton } from './VoiceInputButton';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Send, BookOpen, RefreshCw, Plus, Search, 
  PanelLeftClose, PanelLeftOpen, ShieldCheck, 
  Sparkles, ChevronRight, Home, HelpCircle,
  Sliders, FileCheck, Cpu, X, UserCheck, CheckCircle2,
  Pin, Share2, MessageSquare, Wand2, Trash2
} from 'lucide-react';

interface ChatAssistantProps {
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (j: Jurisdiction) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onAnalysisResult: (result: QueryResult) => void;
  activeResult: QueryResult | null;
  lawYear?: string;
  onNavigateTab: (tab: string) => void;
  onOpenHelp?: () => void;
  initialQuery?: string | null;
  onClearInitialQuery?: () => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  files?: UploadedFile[];
  result?: QueryResult;
}

function createVerdictStatement(result: QueryResult, queryText: string): string {
  const cat = result.classification?.category || '';
  const isNonAudit = ['CONVERSATIONAL', 'STATUTORY_INFORMATION', 'HYBRID_GUIDANCE'].includes(cat);

  if (isNonAudit) {
    return result.classification?.description || 
      'I am IP-SAKTI Sahayak, your AI Decision Engine for Ayurvedic IPR & Biodiversity compliance. How can I assist you today?';
  }

  const score = result.readinessPassport?.overallScore || 70;
  const blockers = result.readinessPassport?.criticalBlockers || [
    'Section 3(d) synergistic bio-activity data required under Patents Act 1970',
    'NBA Form III pre-approval required under Biological Diversity Act 2023'
  ];
  const isPatentReady = score >= 85 && blockers.length === 0;

  let stmt = '';
  if (isPatentReady) {
    stmt = `STATUTORY VERDICT: PATENT GRANT READY (Score: ${score}%)\nMeets all statutory criteria under Patents Act 1970 (Sec 3p/3d), BD Act 2023, and AYUSH guidelines.`;
  } else {
    stmt = `STATUTORY VERDICT: CONDITIONAL READINESS (Score: ${score}%)\nYou are currently missing ${blockers.length} statutory requirements for patent grant:\n` +
      blockers.map((b, i) => `  ${i + 1}. ${b}`).join('\n');
  }
  stmt += `\n\n### Innovation vs Possible Route Assessment (Patent Claim Analysis)\n\n` +
    `| Innovation | Possible route | Brief Assessment (Supports / Unsupports Patent Claim) |\n` +
    `| :--- | :--- | :--- |\n` +
    `| **Novel formulation/process** | Patent | **Supports**: Novel standardized extraction protocols or non-obvious synergistic combinations overcome Section 3(d)/3(e) to support patent claims. |\n` +
    `| **Brand name** | Trademark | **Unsupports Patent Directly**: Brand identity is protected under Trademark Act 1999; commercial branding cannot be claimed within a technical patent. |\n` +
    `| **Product appearance** | Design | **Unsupports Patent Directly**: Aesthetic packaging/capsule shape is protected under Designs Act 2000; does not satisfy technical novelty for patent claims. |\n` +
    `| **Geographic origin** | GI | **Unsupports Patent Monopoly**: Terroir/origin (e.g. Nagori Ashwagandha) is protected via Geographical Indications Act 1999; triggers NBA ABS duties rather than exclusive patent rights. |\n` +
    `| **Confidential manufacturing process** | Trade secret | **Alternative / Supportive**: Proprietary unpatented extraction parameters can be held as trade secrets without 20-year disclosure, preserving exclusivity. |\n` +
    `| **New plant variety** | Plant-variety protection | **Unsupports Patent Directly**: Novel botanical varieties are protected under the Protection of Plant Varieties & Farmers' Rights Act 2001 (PPV&FR), not Patents Act. |\n` +
    `| **Original software/content** | Copyright | **Unsupports Patent Directly**: Educational literature, monographs, and diagnostic algorithms are protected under Copyright Act 1957; does not support formulation patent claims. |\n` +
    `| **Traditional knowledge** | Generally defensive protection rather than conventional patenting | **Unsupports (Defensive Only)**: Pre-existing classical formulations are statutorily barred under Section 3(p); requires documented synergistic enhancement to support patent claims. |\n\n` +
    `Statutory 4-agent audit & GraphRAG synthesis complete for: "${queryText}". Select any tool button below (Pins, Graph, Passport) to view full legal evidence.`;
  return stmt;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  jurisdiction,
  onJurisdictionChange,
  selectedLanguage,
  onLanguageChange,
  onAnalysisResult,
  activeResult,
  lawYear = '2024',
  onNavigateTab,
  onOpenHelp,
  initialQuery,
  onClearInitialQuery
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['en'];
  const [inputQuery, setInputQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(initialQuery && initialQuery.trim()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeModalTool, setActiveModalTool] = useState<'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | 'graph' | 'citations' | null>(null);
  const [isDockOpen, setIsDockOpen] = useState(false);

  const handleOpenToolForMessage = (tool: 'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | 'graph' | 'citations', result?: QueryResult) => {
    if (result) {
      onAnalysisResult(result);
    }
    setActiveModalTool(prev => (prev === tool ? null : tool));
    setIsSidebarOpen(false);
  };

  const handleOpenTool = (tool: 'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | 'graph' | 'citations') => {
    handleOpenToolForMessage(tool);
  };
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  const [facilitatorFormSubmitted, setFacilitatorFormSubmitted] = useState(false);

  // Selected history item / session tracking for current chat
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(() => {
    if (activeResult?.queryId) return activeResult.queryId;
    return null;
  });

  // Continuous Chat Conversation Messages Stream (ChatGPT / Claude style)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialQuery && initialQuery.trim()) {
      return [
        {
          id: `user-init-${Date.now()}`,
          sender: 'user',
          text: initialQuery.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
    if (activeResult) {
      const q = activeResult.userQuery || 'AYUSH Formulation Audit';
      return [
        {
          id: 'msg-user-init',
          sender: 'user',
          text: q,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-asst-init',
          sender: 'assistant',
          text: createVerdictStatement(activeResult, q),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          result: activeResult
        }
      ];
    }
    return [];
  });

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persistent Audit History Items (SQLite backend / localStorage sync)
  const [historyItems, setHistoryItems] = useState<AuditHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ipsakti_audit_history');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage audit history:', e);
    }
    return [];
  });

  // Sync history from backend SQLite DB on mount
  React.useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    fetch(`${API_BASE}/api/v1/history`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.sessions)) {
          if (data.sessions.length === 0) {
            setHistoryItems([]);
            localStorage.setItem('ipsakti_audit_history', JSON.stringify([]));
            return;
          }

          // Build a map of existing local messages so continuous multi-turn chat threads are preserved
          const existingLocalMessages = new Map<string, ChatMessage[]>();
          try {
            const saved = localStorage.getItem('ipsakti_audit_history');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                for (const it of parsed) {
                  if (it.id && Array.isArray(it.messages) && it.messages.length > 0) {
                    existingLocalMessages.set(it.id, it.messages);
                  }
                }
              }
            }
          } catch (e) {}

          const seenQueries = new Set<string>();
          const mappedSessions: AuditHistoryItem[] = [];

          for (const sess of data.sessions) {
            const rawQuery = sess.query || sess.title || '';
            const normQ = rawQuery.trim().toLowerCase();
            if (normQ && seenQueries.has(normQ)) {
              continue;
            }
            if (normQ) {
              seenQueries.add(normQ);
            }

            let resObj = sess.result;
            if (typeof resObj === 'string') {
              try { resObj = JSON.parse(resObj); } catch (e) {}
            }

            let mappedResult: QueryResult;
            if (resObj && (resObj.readiness_passport || resObj.readinessPassport || resObj.classification)) {
              mappedResult = mapBackendResponseToQueryResult(resObj, rawQuery || 'AYUSH Audit', jurisdiction, lawYear);
            } else {
              mappedResult = getMockAnalysisForQuery(rawQuery || 'AYUSH Formulation Audit', jurisdiction);
            }

            const sessId = sess.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            mappedSessions.push({
              id: sessId,
              query: rawQuery,
              title: sess.title || rawQuery.slice(0, 36),
              timestamp: sess.timestamp || 'Recent',
              score: sess.score !== undefined ? Number(sess.score) : (mappedResult.readinessPassport?.overallScore ?? 70),
              result: mappedResult,
              messages: existingLocalMessages.get(sessId)
            });
          }

          setHistoryItems(mappedSessions);
          localStorage.setItem('ipsakti_audit_history', JSON.stringify(mappedSessions));
        }
      })
      .catch(err => console.log('Backend history fetch skipped:', err.message));
  }, []);

  const lastProcessedInitialQuery = React.useRef<string | null>(null);

  const handleQuerySubmit = async (queryText: string, isFreshSession = false) => {
    const hasContent = queryText.trim() || attachedFiles.length > 0;
    if (!hasContent) return;

    const finalQuery = attachedFiles.length > 0
      ? `${queryText.trim()} [Attached: ${attachedFiles.map(f => f.name).join(', ')}]`
      : queryText.trim();

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine if this is a new chat session or a follow-up query in the existing continuous chat
    const isNewSession = isFreshSession || !selectedHistoryId || messages.length === 0;
    const currentSessionId = isNewSession
      ? `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      : selectedHistoryId;

    if (isNewSession) {
      setSelectedHistoryId(currentSessionId);
    }

    // Append User Message to continuous stream
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: finalQuery,
      timestamp: timeStr,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    let nextMessages: ChatMessage[] = [];
    if (isNewSession) {
      nextMessages = [userMsg];
      setMessages([userMsg]);
    } else {
      setMessages(prev => {
        if (prev.length === 1 && prev[0].sender === 'user' && prev[0].text === finalQuery) {
          nextMessages = prev;
          return prev;
        }
        nextMessages = [...prev, userMsg];
        return nextMessages;
      });
    }
    setInputQuery('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const result = await analyzeQuery(finalQuery, jurisdiction, lawYear, currentSessionId);
      onAnalysisResult(result);

      const verdictStatement = createVerdictStatement(result, finalQuery);

      // Append Assistant Response Message to continuous stream
      const asstMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: verdictStatement,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: result
      };

      const finalMessages = isNewSession ? [userMsg, asstMsg] : [...(nextMessages.length > 0 ? nextMessages : messages), asstMsg];
      setMessages(finalMessages);

      const querySnippet = finalQuery.length > 36 ? finalQuery.substring(0, 36) + '...' : finalQuery;

      setHistoryItems(prev => {
        let updated: AuditHistoryItem[];
        if (isNewSession) {
          const newItem: AuditHistoryItem = {
            id: currentSessionId,
            query: finalQuery,
            title: querySnippet,
            timestamp: timeStr,
            score: result.readinessPassport?.overallScore ?? 70,
            result,
            messages: finalMessages
          };
          const normQ = finalQuery.trim().toLowerCase();
          updated = [newItem, ...prev.filter(i => i.id !== currentSessionId && (i.query || '').trim().toLowerCase() !== normQ)];
        } else {
          // Update the existing session in place (preserves original session title & ID, updates timestamp, score, result, and all messages)
          updated = prev.map(item => {
            if (item.id === currentSessionId) {
              return {
                ...item,
                timestamp: timeStr,
                score: result.readinessPassport?.overallScore ?? item.score,
                result,
                messages: finalMessages
              };
            }
            return item;
          });
          if (!updated.some(i => i.id === currentSessionId)) {
            updated.unshift({
              id: currentSessionId,
              query: finalQuery,
              title: querySnippet,
              timestamp: timeStr,
              score: result.readinessPassport?.overallScore ?? 70,
              result,
              messages: finalMessages
            });
          }
        }
        try {
          localStorage.setItem('ipsakti_audit_history', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (err) {
      console.error('Analysis Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically execute query when coming from Landing Hero page
  React.useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      const queryToRun = initialQuery.trim();
      if (lastProcessedInitialQuery.current !== queryToRun) {
        lastProcessedInitialQuery.current = queryToRun;
        onClearInitialQuery?.();
        handleQuerySubmit(queryToRun, true);
      }
    }
  }, [initialQuery]);

  const handleNewAudit = () => {
    setSelectedHistoryId(null);
    onAnalysisResult(null as any);
    setMessages([]);
    setInputQuery('');
    setAttachedFiles([]);
  };

  const handleClearHistory = async () => {
    setHistoryItems([]);
    setSelectedHistoryId(null);
    onAnalysisResult(null as any);
    setMessages([]);
    try {
      localStorage.setItem('ipsakti_audit_history', JSON.stringify([]));
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      await fetch(`${API_BASE}/api/v1/history`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear audit history:', e);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('ipsakti_audit_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      fetch(`${API_BASE}/api/v1/history/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {}
  };

  const handleSelectHistoryItem = async (item: AuditHistoryItem) => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    setSelectedHistoryId(item.id);

    try {
      let raw = item.result;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch (e) {}
      }

      const mapped = mapBackendResponseToQueryResult(
        raw || item,
        item.query || item.title || 'AYUSH Formulation Audit',
        jurisdiction,
        lawYear
      );

      onAnalysisResult(mapped);

      const timeStr = item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const cat = mapped.classification?.category || '';

      let histText = '';
      if (['CONVERSATIONAL', 'STATUTORY_INFORMATION', 'HYBRID_GUIDANCE'].includes(cat)) {
        histText = mapped.classification?.description || 'Historical AI response retrieved.';
      } else {
        const score = mapped.readinessPassport?.overallScore ?? item.score ?? 70;
        const blockers = mapped.readinessPassport?.criticalBlockers || [];
        const statusTitle = score >= 75 ? 'PATENT GRANT READY' : 'CONDITIONAL READINESS';

        let blockerSummary = '';
        if (blockers.length > 0) {
          blockerSummary = `\nKey Statutory Considerations:\n` + blockers.slice(0, 3).map((b, i) => `  ${i + 1}. ${b}`).join('\n');
        } else {
          blockerSummary = `\nMissing 2 Statutory Requirements for Patent Grant:\n  1. Section 3(d) synergistic bio-activity data required under Patents Act 1970.\n  2. Mandatory Form III pre-approval required under Biological Diversity Act 2023.`;
        }

        histText = `STATUTORY VERDICT: ${statusTitle} (Score: ${score}%)${blockerSummary}\n\nStatutory 4-agent audit & GraphRAG synthesis complete for "${item.query || item.title || 'AYUSH Audit'}". Select any tool below to inspect details.`;
      }

      if (Array.isArray(item.messages) && item.messages.length > 0) {
        setMessages(item.messages);
      } else {
        const initialMsgs: ChatMessage[] = [
          {
            id: `user-hist-${item.id}`,
            sender: 'user',
            text: item.query || item.title || 'AYUSH Formulation Audit',
            timestamp: timeStr
          },
          {
            id: `asst-hist-${item.id}`,
            sender: 'assistant',
            text: histText,
            timestamp: timeStr,
            result: mapped
          }
        ];
        setMessages(initialMsgs);
        item.messages = initialMsgs;
      }
    } catch (err) {
      console.error('History item selection error:', err);
    }
  };

  const filteredHistory = historyItems.filter(item => 
    (item.title && item.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (item.query && item.query.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950 flex overflow-hidden font-sans selection:bg-slate-800 selection:text-white">
      {/* Pure White Left Navigation & History Sidebar */}
      <div 
        className={`bg-white text-slate-950 transition-all duration-300 flex flex-col z-20 shrink-0 border-r border-slate-200 shadow-sm ${
          isSidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Top Header with Back to Home & + New Audit Button */}
        <div className="p-3 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('hero')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              title="Return to Landing Page"
            >
              <AntigravityLogo size={28} />
              <BrandName size="sm" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleNewAudit}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition-all shadow-md cursor-pointer border border-slate-950"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span>New Formulation Audit</span>
            </div>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">Ctrl N</kbd>
          </button>

          {/* Audit History Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search audit history..."
              className="w-full bg-slate-50 text-slate-950 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:border-slate-950 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Audit History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Recent Audits ({filteredHistory.length})
              </span>
              {historyItems.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-slate-500 hover:text-slate-950 font-mono transition-colors cursor-pointer"
                  title="Clear all stored audit history"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {filteredHistory.map((item) => {
                const isActive = selectedHistoryId ? selectedHistoryId === item.id : (activeResult?.userQuery === item.query);
                
                // Smart title formatter to eliminate repetitive "I have developed..." titles
                let displayTitle = item.title;
                if (!displayTitle || displayTitle.toLowerCase().startsWith('i have developed') || displayTitle.toLowerCase().startsWith('we created')) {
                  const q = (item.query || '').trim();
                  if (q.toLowerCase().includes('curcumin')) displayTitle = 'Curcumin Bioactive Extract Audit';
                  else if (q.toLowerCase().includes('ashwagandha')) displayTitle = 'Ashwagandha + Guduchi Stress Audit';
                  else if (q.toLowerCase().includes('chyawanprash')) displayTitle = 'Classical Chyawanprash Modification';
                  else if (q.toLowerCase().includes('tea') || q.toLowerCase().includes('aahar')) displayTitle = 'Ayurveda-Aahar Functional Tea';
                  else if (q.toLowerCase().includes('bramhi') || q.toLowerCase().includes('guggulu')) displayTitle = 'Poly-Herbal Liposomal Audit';
                  else {
                    const cleaned = q
                      .replace(/^i have developed a /i, '')
                      .replace(/^we created a /i, '')
                      .replace(/^we modified the /i, '')
                      .replace(/^novel /i, '');
                    displayTitle = cleaned.length > 34 ? cleaned.substring(0, 34) + '...' : cleaned || 'AYUSH Formulation Audit';
                  }
                }

                const itemScore = item.score !== undefined ? item.score : (item.result?.readinessPassport?.overallScore ?? 76);

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectHistoryItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectHistoryItem(item);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer border relative overflow-hidden select-none ${
                      isActive
                        ? 'bg-slate-950 border-slate-950 text-white font-bold shadow-sm ring-1 ring-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-xs'
                    }`}
                  >
                    {/* Google Rainbow Subtle Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/10 via-[#ea4335]/5 via-[#fbbc05]/5 to-[#34a853]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="truncate pr-2 min-w-0 flex-1 relative z-10">
                      <span className={`text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-slate-950'}`}>
                        {displayTitle}
                      </span>
                      <span className={`text-[10px] font-mono block truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center shrink-0 relative z-10">
                      {/* Score display for formulation audits only; do not print CHAT/GUIDE/HYBRID classification badges */}
                      {itemScore > 0 && !['CONVERSATIONAL', 'STATUTORY_INFORMATION', 'HYBRID_GUIDANCE'].includes(item.result?.classification?.category || '') && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive 
                            ? 'bg-slate-800 text-white border-slate-700' 
                            : 'bg-slate-100 text-slate-950 border-slate-200'
                        }`}>
                          {itemScore}%
                        </span>
                      )}

                      {/* Individual history item deletion */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className={`ml-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive
                            ? 'text-slate-400 hover:text-red-300 hover:bg-slate-800'
                            : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
                        }`}
                        title="Delete this audit from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs font-mono border border-dashed border-slate-200 rounded-xl">
                  No audits found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Storage Badge Footer */}
        <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-700 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
            <span className="font-bold text-slate-950">IP-SAKTI Storage</span>
          </div>
          <span>{historyItems.length} {historyItems.length === 1 ? 'Audit' : 'Audits'} Saved</span>
        </div>
      </div>

      {/* Main Monochrome Full-Screen Workspace with Antigravity 4-Color Halo Background */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-950 relative overflow-hidden">
        {/* Antigravity 4-Color Halo Glow (Background Accent Only) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/12 via-[#fbbc05]/12 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Workspace Top Bar */}
        <div className="p-3 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-10 shadow-xs relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-950 transition-colors border border-slate-300"
              title="Toggle Audit History Sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onNavigateTab('hero')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold transition-all border border-slate-800 hover:bg-slate-800"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.home}</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black font-display text-slate-950 truncate max-w-xs sm:max-w-md">
                  {activeResult ? activeResult.userQuery : 'New Formulation Audit'}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Matte Black / White Dual Jurisdiction Toggle */}
            <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs">
              <button
                onClick={() => onJurisdictionChange('INDIA')}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                  jurisdiction === 'INDIA'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                IN
              </button>
              <button
                onClick={() => onJurisdictionChange('INTERNATIONAL')}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                  jurisdiction === 'INTERNATIONAL'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Global
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                onLanguageChange(lang);
                triggerGoogleTranslate(lang);
              }}
              className="bg-slate-100 text-slate-950 font-bold rounded-full px-2.5 py-1 text-xs border border-slate-300 focus:outline-none cursor-pointer hidden sm:block"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="sa">संस्कृतम्</option>
              <option value="ta">தமிழ்</option>
            </select>

            {/* Help Drawer Trigger Button */}
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold text-xs border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Open Help & Statutory Knowledge Base"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Help</span>
            </button>

            {activeResult && (
              <ExportRolloutButton result={activeResult} />
            )}
          </div>
        </div>

        {/* Scrollable Workspace Content — ChatGPT / Claude Style Continuous Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-48 sm:pb-56 relative z-10">
          {/* Welcome Greeting State (Only when no messages in session) */}
          {messages.length === 0 && !isLoading && (
            <div className="max-w-2xl mx-auto my-12 text-center space-y-6">
              <div className="flex justify-center">
                <AntigravityLogo size={64} className="p-1.5 shadow-md border-slate-200 hover:scale-105 transition-transform duration-200" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
                Where should we begin your AYUSH IP Audit?
              </h2>

              <p className="text-sm text-slate-600 max-w-lg mx-auto font-medium">
                Enter any Ayurvedic botanical formulation, extract combination, or product claim below to run the 4-agent statutory audit.
              </p>

              {/* Sample Quick Action Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4">
                {SAMPLE_QUERIES.map((sq: SampleQuery) => (
                  <button
                    key={sq.id}
                    onClick={() => {
                      setInputQuery(sq.query);
                      handleQuerySubmit(sq.query);
                    }}
                    className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-950 group-hover:text-slate-900">
                        {sq.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">{sq.query}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continuous Messages Stream */}
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end my-4 animate-fade-in">
                    <div className="max-w-2xl bg-slate-950 text-white rounded-3xl rounded-tr-xs px-5 py-4 shadow-xl border border-slate-900 space-y-2">
                      <p className="text-xs sm:text-sm font-medium leading-relaxed">{msg.text}</p>
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.files.map(f => (
                            <span key={f.id} className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                              📎 {f.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono block text-right font-semibold">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="space-y-6 my-6 animate-fade-in">
                  {/* Assistant Speech Header */}
                  <div className="flex items-center gap-3">
                    <AntigravityLogo size={36} className="shadow-xs" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black font-display text-slate-950 uppercase tracking-wider block">
                          IP-SAKTI Sahayak Agent Engine
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assistant Speech Card & Conversational Response */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4 font-sans ml-0 sm:ml-11">
                    <MarkdownRenderer content={msg.text} />

                    {/* Brief Statutory Summary pill (Audit Mode only) */}
                    {msg.result && !['CONVERSATIONAL', 'STATUTORY_INFORMATION', 'HYBRID_GUIDANCE'].includes(msg.result.classification?.category || '') && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-medium">
                        <div className="flex items-center justify-between text-slate-950 font-bold">
                          <span>{msg.result.classification?.title || 'AYUSH Statutory Audit'}</span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-bold">
                            Score: {msg.result.readinessPassport?.overallScore || 78}%
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-normal">{msg.result.classification?.description}</p>
                      </div>
                    )}

                    {/* Context-Aware Action Buttons Row (Pins, Graph, Harness, IP Strategy, Passport) */}
                    {(() => {
                      if (!msg.result) return null;
                      const cat = msg.result.classification?.category || '';

                      // Only show formulation/patentability evaluation tools when this was an actual formulation or invention audit
                      const isFormulationOrAudit = !['CONVERSATIONAL', 'STATUTORY_INFORMATION'].includes(cat);
                      const hasCitations = Array.isArray(msg.result.citations) && msg.result.citations.length > 0;
                      const hasGraph = Array.isArray(msg.result.nodes) && msg.result.nodes.length > 0;
                      const hasIpMap = Array.isArray(msg.result.ipMap) && msg.result.ipMap.length > 0;
                      const hasValidScore = (msg.result.readinessPassport?.overallScore ?? 0) > 0;

                      // Statutory guide / definitions (like "what is a patent") do NOT need audit tool buttons
                      const showPins = isFormulationOrAudit && hasCitations;
                      const showGraph = isFormulationOrAudit && hasGraph;
                      const showTkdl = isFormulationOrAudit;
                      const showIpStrategy = isFormulationOrAudit && hasIpMap;
                      const showWhatIf = isFormulationOrAudit;
                      const showPassport = isFormulationOrAudit && hasValidScore;

                      if (!showPins && !showGraph && !showTkdl && !showIpStrategy && !showWhatIf && !showPassport) {
                        return null;
                      }

                      return (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          {showPins && (
                            <button
                              onClick={() => handleOpenToolForMessage('citations', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="View Statutory Pins & Citations"
                            >
                              <Pin className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>Pins ({msg.result.citations.length})</span>
                            </button>
                          )}

                          {showGraph && (
                            <button
                              onClick={() => handleOpenToolForMessage('graph', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="Open Interactive Topology Graph"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>Graph</span>
                            </button>
                          )}

                          {showTkdl && (
                            <button
                              onClick={() => handleOpenToolForMessage('tkdl', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="Open TKDL Prior-Art Overlap Radar"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>TKDL Radar</span>
                            </button>
                          )}

                          {showIpStrategy && (
                            <button
                              onClick={() => handleOpenToolForMessage('classifier', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="View Regulatory Classification & IP Strategy"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>IP Strategy</span>
                            </button>
                          )}

                          {showWhatIf && (
                            <button
                              onClick={() => handleOpenToolForMessage('whatif', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="Simulate modifications to this formula in What-If tool"
                            >
                              <Sliders className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>What-If</span>
                            </button>
                          )}

                          {showPassport && (
                            <button
                              onClick={() => handleOpenToolForMessage('passport', msg.result!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                              title="View 5-Pillar Scorecard & Passport"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                              <span>Passport</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Dynamic Follow-up Suggested Quick Re-Chat Chips */}
                    {(() => {
                      if (!msg.result) return null;
                      const cat = msg.result.classification?.category || '';
                      if (cat === 'CONVERSATIONAL') return null;

                      const followUpPrompts = cat === 'STATUTORY_INFORMATION'
                        ? [
                            'What are the procedural deadlines under Indian patent law?',
                            'How do official filing fees differ for startups vs corporates?',
                            'What forms are required for national phase PCT entry?'
                          ]
                        : [
                            'What about Section 3(d) efficacy data requirement?',
                            'How to submit NBA Form III under BD Act 2023?',
                            'Check PCT export clearance for USA & WIPO'
                          ];

                      return (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {followUpPrompts.map((promptText, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => {
                                setInputQuery(promptText);
                                handleQuerySubmit(promptText);
                              }}
                              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-[11px] font-bold transition-all border border-slate-300 cursor-pointer flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3 h-3 text-slate-600 shrink-0" />
                              <span>{promptText}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator at end of message stream */}
            {isLoading && (
              <div className="max-w-2xl my-6 p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-lg ml-0 sm:ml-11">
                <div className="w-8 h-8 border-3 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-xs font-bold text-slate-950 font-display">Executing Parallel Subagent Statutory Audit...</h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  Researcher ➔ Auditor ➔ Devil's Advocate ➔ Strategist evaluating prior art & legal provisions.
                </p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Bottom Input Bar — rounded-3xl with 100% full-width input */}
        <div className="absolute bottom-4 left-4 right-4 max-w-3xl mx-auto z-30">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl google-shimmer-border overflow-hidden">
            {/* Smart Auto-Routing Strip */}
            <div className="px-4 py-1.5 flex items-center justify-center gap-1.5 border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="font-bold text-slate-700">AI Decision Engine</span>
              <span className="hidden sm:inline text-slate-500">— Statutory patentability, ABS clearance & prior-art intelligence</span>
            </div>

            {/* File chips row above input */}
            {attachedFiles.length > 0 && (
              <div className="px-4 pt-3 pb-1 border-b border-slate-100 bg-slate-50/60">
                <FileChipsList
                  files={attachedFiles}
                  onRemove={(id) => setAttachedFiles(prev => prev.filter(f => f.id !== id))}
                />
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2.5 p-2.5 pl-4 pr-2.5 min-h-[54px]">
              {/* Paperclip Trigger */}
              <FileUploadTrigger
                onFilesSelect={(newFiles) => setAttachedFiles(prev => [...prev, ...newFiles])}
              />

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuerySubmit(inputQuery);
                  }
                }}
                placeholder={attachedFiles.length > 0 ? 'Add context or submit attached files...' : t.askPlaceholder}
                className="flex-1 min-w-0 bg-transparent text-slate-950 text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 py-1.5 relative z-10"
              />

              <VoiceInputButton
                currentText={inputQuery}
                onTranscript={(spokenText) => setInputQuery(spokenText)}
                lang={selectedLanguage}
              />

              <button
                onClick={() => handleQuerySubmit(inputQuery)}
                disabled={isLoading || (!inputQuery.trim() && attachedFiles.length === 0)}
                className="bg-slate-950 hover:bg-slate-800 p-2.5 rounded-full text-white disabled:opacity-30 transition-all shrink-0 shadow-md cursor-pointer"
                title="Send query"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Rolling Tool Dock (Fixed Overlay FAB & Dock) — Hidden when tool drawer is open to prevent overlapping */}
        {!activeModalTool && (
          <div className="fixed bottom-22 right-6 z-40 flex items-center gap-2">
            {/* Expanded Roll-Out Pill Dock */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/95 backdrop-blur-xl border border-slate-800 text-white shadow-2xl transition-all duration-300 transform origin-right ${
                isDockOpen
                  ? 'opacity-100 scale-100 translate-x-0 max-w-3xl'
                  : 'opacity-0 scale-90 translate-x-8 max-w-0 overflow-hidden pointer-events-none'
              }`}
            >
              <button
                onClick={() => {
                  handleOpenTool('classifier');
                  setIsDockOpen(false);
                }}
                className={`relative group/dock px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeModalTool === 'classifier'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {/* Floating Hover Hint */}
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/dock:opacity-100 translate-y-1 group-hover/dock:translate-y-0 transition-all duration-150 z-50">
                  <span>SLA 25D, CDSCO & FSSAI Category</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                <span>Classifier</span>
              </button>

              <button
                onClick={() => {
                  handleOpenTool('tkdl');
                  setIsDockOpen(false);
                }}
                className={`relative group/dock px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeModalTool === 'tkdl'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {/* Floating Hover Hint */}
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/dock:opacity-100 translate-y-1 group-hover/dock:translate-y-0 transition-all duration-150 z-50">
                  <span>Scan classical text prior art overlap</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
                </div>
                <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                <span>TKDL Radar</span>
              </button>

              <button
                onClick={() => {
                  handleOpenTool('abs');
                  setIsDockOpen(false);
                }}
                className={`relative group/dock px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeModalTool === 'abs'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {/* Floating Hover Hint */}
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/dock:opacity-100 translate-y-1 group-hover/dock:translate-y-0 transition-all duration-150 z-50">
                  <span>Verify Biodiversity Act & NBA Form III duty</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                <span>ABS Checker</span>
              </button>

              <button
                onClick={() => {
                  handleOpenTool('whatif');
                  setIsDockOpen(false);
                }}
                className={`relative group/dock px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeModalTool === 'whatif'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {/* Floating Hover Hint */}
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/dock:opacity-100 translate-y-1 group-hover/dock:translate-y-0 transition-all duration-150 z-50">
                  <span>Simulate purity, botanicals & market impact</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
                </div>
                <Sliders className="w-3.5 h-3.5 text-slate-300" />
                <span>What-If</span>
              </button>

              <button
                onClick={() => {
                  handleOpenTool('passport');
                  setIsDockOpen(false);
                }}
                className={`relative group/dock px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeModalTool === 'passport'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {/* Floating Hover Hint */}
                <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/dock:opacity-100 translate-y-1 group-hover/dock:translate-y-0 transition-all duration-150 z-50">
                  <span>5-Pillar IP Readiness Scorecard & PDF</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
                </div>
                <FileCheck className="w-3.5 h-3.5 text-slate-300" />
                <span>Passport</span>
              </button>
            </div>

            {/* Main Rolling Trigger FAB Button with Hover Hint */}
            <div className="relative group/trigger">
              <div className="absolute bottom-full mb-2.5 right-0 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10.5px] font-medium tracking-normal whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover/trigger:opacity-100 translate-y-1 group-hover/trigger:translate-y-0 transition-all duration-150 z-50">
                <span>{isDockOpen ? 'Collapse quick tools dock' : 'Open quick tools dock'}</span>
                <div className="absolute top-full right-4 -mt-[1px] border-4 border-transparent border-t-slate-900" />
              </div>
              <button
                onClick={() => setIsDockOpen(prev => !prev)}
                className={`p-3.5 rounded-full bg-slate-950 text-white shadow-2xl border border-slate-800 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center group ${
                  isDockOpen ? 'bg-slate-900 ring-2 ring-slate-400 rotate-90' : 'hover:bg-slate-900'
                }`}
              >
                {isDockOpen ? (
                  <X className="w-5 h-5 text-white transition-transform" />
                ) : (
                  <Wand2 className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right-Side Inline Tool Drawer Panel (Flex Sibling — Same Level as Sidebar & Workspace) */}
      {activeModalTool && (
        <div className="w-full sm:w-[560px] md:w-[660px] lg:w-[740px] xl:w-[820px] max-w-full h-full flex flex-col bg-white text-slate-950 border-l border-slate-200 shrink-0 animate-slide-in-right shadow-2xl relative z-30 overflow-hidden">
          {/* Google 4-Color Rainbow Ambient Background Halo */}
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-gradient-to-r from-[#4285f4]/20 via-[#ea4335]/15 via-[#fbbc05]/15 to-[#34a853]/20 blur-3xl pointer-events-none rounded-full" />

          {/* Drawer Header with Guidance & Close */}
          <div className="p-4 bg-white/90 backdrop-blur-xl flex items-center justify-between border-b border-slate-200 shrink-0 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                {activeModalTool === 'classifier' && <ShieldCheck className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'tkdl' && <BookOpen className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'abs' && <ShieldCheck className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'whatif' && <Sliders className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'passport' && <FileCheck className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'architecture' && <Cpu className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'graph' && <Share2 className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'citations' && <Pin className="w-5 h-5 text-slate-950" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black font-display text-slate-950 truncate">
                  {activeModalTool === 'classifier' && 'Regulatory Classifier & Strategy'}
                  {activeModalTool === 'tkdl' && 'TKDL Prior-Art Radar'}
                  {activeModalTool === 'abs' && 'ABS Duty Checker'}
                  {activeModalTool === 'whatif' && 'What-If Simulator'}
                  {activeModalTool === 'passport' && 'Readiness Passport'}
                  {activeModalTool === 'architecture' && '4-Agent Architecture Harness'}
                  {activeModalTool === 'graph' && 'Evidence Topology Graph'}
                  {activeModalTool === 'citations' && 'Verified Statutory Pins & Citations'}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium truncate">
                  {activeModalTool === 'classifier' && 'Categorize under SLA 25D, CDSCO, or FSSAI'}
                  {activeModalTool === 'tkdl' && 'Review Section 3(p) prior art overlap'}
                  {activeModalTool === 'abs' && 'Complete NBA Form III requirements'}
                  {activeModalTool === 'whatif' && 'Adjust parameters to test score impact'}
                  {activeModalTool === 'passport' && 'Review 5-pillar scorecards & export PDF'}
                  {activeModalTool === 'architecture' && 'Inspect 4-Agent RAG pipeline traces'}
                  {activeModalTool === 'graph' && 'Interactive GraphRAG evidence network'}
                  {activeModalTool === 'citations' && 'Grounded statutory provisions & act sections'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModalTool(null)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer shrink-0 ml-2 border border-slate-200"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body — scrollable tool content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-none">
            {(() => {
              const displayResult = activeResult || getMockAnalysisForQuery('Ashwagandha Extract Formulation', jurisdiction);
              return (
                <>
                  {activeModalTool === 'classifier' && (
                    <ProductClassifier
                      currentQuery={activeResult?.userQuery}
                      initialCategory={activeResult?.classification?.category}
                      onClassifyComplete={(c) => {
                        if (activeResult) {
                          onAnalysisResult({ ...activeResult, classification: c });
                        }
                        setActiveModalTool(null);
                      }}
                      onSendToChat={(prompt) => {
                        setActiveModalTool(null);
                        setInputQuery(prompt);
                        handleQuerySubmit(prompt);
                      }}
                    />
                  )}
                  {activeModalTool === 'tkdl' && (
                    <TKDLRadar matches={displayResult.tkOverlap} queryConcept={displayResult.userQuery} />
                  )}
                  {activeModalTool === 'abs' && (
                    <ABSChecker analysis={displayResult.absAnalysis} />
                  )}
                  {activeModalTool === 'whatif' && (
                    <WhatIfSimulator
                      activeQuery={activeResult?.userQuery}
                      onClose={() => setActiveModalTool(null)}
                      onSendToChat={(prompt) => {
                        setActiveModalTool(null);
                        setInputQuery(prompt);
                        handleQuerySubmit(prompt);
                      }}
                    />
                  )}
                  {activeModalTool === 'passport' && (
                    <ReadinessPassport passport={displayResult.readinessPassport} result={displayResult} />
                  )}
                  {activeModalTool === 'architecture' && (
                    <ArchitectureView />
                  )}
                  {activeModalTool === 'graph' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-slate-950 shrink-0" />
                        <span><strong>Evidence Topology Graph</strong>: Interactive legal & scientific entity relationship network.</span>
                      </div>
                      <EvidenceGraph nodes={displayResult.nodes || []} edges={displayResult.edges || []} />
                    </div>
                  )}
                  {activeModalTool === 'citations' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2">
                        <Pin className="w-4 h-4 text-slate-950 shrink-0" />
                        <span><strong>Verified Statutory Pins & Legal Sources</strong>: Grounded excerpts with confidence ratings.</span>
                      </div>
                      {(displayResult.citations || []).map((cit) => (
                        <div key={cit.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                              <span className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                                <Pin className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                                <span>{cit.statuteOrSource}</span>
                              </span>
                              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-900 border border-slate-200 shrink-0">
                                {cit.provision}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-slate-950 text-white shrink-0 self-start sm:self-auto shadow-xs whitespace-nowrap">
                              {cit.confidenceScore}% Grounded
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 italic font-medium leading-relaxed border-l-2 border-slate-900 pl-3 py-0.5">
                            "{cit.excerpt}"
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-600 font-mono">
                            <span>Authority: <strong className="text-slate-950 font-bold">{cit.authorityLevel}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Effective: <strong className="text-slate-950 font-bold">{cit.yearOrVersion}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* AYUSH IP Facilitator Modal */}
      {isFacilitatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-300 max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden text-slate-950">
            {/* Google Rainbow Hover Halo */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/15 via-[#fbbc05]/15 to-[#34a853]/15 blur-3xl pointer-events-none rounded-full" />

            <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-display text-slate-950">AYUSH IP Facilitator Cell</h3>
                  <p className="text-xs text-slate-500 font-mono">Ministry of Ayush Statutory Assistance</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsFacilitatorModalOpen(false);
                  setFacilitatorFormSubmitted(false);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-950 transition-colors cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {facilitatorFormSubmitted ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-sm font-bold text-slate-950">Escalation Docket Transmitted!</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Case Docket <strong className="font-mono text-slate-950">AYUSH-IP-8842</strong> assigned. An empanelled AYUSH Patent Agent will contact you within 24 hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsFacilitatorModalOpen(false);
                      setFacilitatorFormSubmitted(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md"
                  >
                    Close Docket Confirmation
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs relative z-10">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-950 flex items-center justify-between">
                    <span>Empanelled AYUSH Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-950">Reg: IN/PA/3942</span>
                  </div>
                  <p className="text-slate-600 font-medium">Dr. Rajesh Sharma — Senior Patent Agent & Ayush Regulatory Specialist</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFacilitatorFormSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Applicant / Organization Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BioHerbs Ayurvedic Labs Ltd."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 text-xs focus:outline-none focus:border-slate-950 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        required
                        placeholder="ip@organization.org"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 text-xs focus:outline-none focus:border-slate-950 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 text-xs focus:outline-none focus:border-slate-950 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Request Summary / Remarks</label>
                    <textarea
                      rows={2}
                      placeholder="Specify patent filing support, Section 3(p) clearance, or NBA Form III submission assistance..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-950 text-xs focus:outline-none focus:border-slate-950 font-medium"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFacilitatorModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Submit Escalation Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
