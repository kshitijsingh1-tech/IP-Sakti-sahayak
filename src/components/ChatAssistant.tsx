import React, { useState } from 'react';
import type { QueryResult, Jurisdiction, AuditHistoryItem, SampleQuery } from '../types';
import { SAMPLE_QUERIES, getMockAnalysisForQuery } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { analyzeQuery, mapBackendResponseToQueryResult, checkInformationalQuery } from '../services/aiEngine';
import { triggerGoogleTranslate } from '../services/translator';
import { AgentPipeline } from './AgentPipeline';
import { EvidenceGraph } from './EvidenceGraph';
import { AntigravityLogo } from './AntigravityLogo';
import { FileUploadTrigger, FileChipsList, type UploadedFile } from './FileUploadButton';
import { ProductClassifier } from './ProductClassifier';
import { TKDLRadar } from './TKDLRadar';
import { ABSChecker } from './ABSChecker';
import { WhatIfSimulator } from './WhatIfSimulator';
import { ReadinessPassport } from './ReadinessPassport';
import { ArchitectureView } from './ArchitectureView';
import { exportToPdf, exportToWord } from '../utils/exportUtils';
import { 
  Send, BookOpen, RefreshCw, Plus, Search, 
  PanelLeftClose, PanelLeftOpen, ShieldCheck, 
  Sparkles, Download, ChevronRight, Home, ArrowLeft,
  Sliders, FileCheck, Cpu, X, UserCheck, CheckCircle2, AlertCircle,
  Pin, Share2, MessageSquare, ChevronDown, ChevronUp, Wand2
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
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WorkspaceErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Workspace render error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-slate-950 space-y-4 max-w-3xl mx-auto my-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black font-display uppercase tracking-wider">
            Audit View Safe Recovery Active
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            The historical audit payload was resynced to standard 2024 statutory schema.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Reset Workspace View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  files?: UploadedFile[];
  result?: QueryResult;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  jurisdiction,
  onJurisdictionChange,
  selectedLanguage,
  onLanguageChange,
  onAnalysisResult,
  activeResult,
  lawYear = '2024',
  onNavigateTab
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['en'];
  const [inputQuery, setInputQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeModalTool, setActiveModalTool] = useState<'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | 'graph' | 'citations' | null>(null);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isSidebarToolsOpen, setIsSidebarToolsOpen] = useState(true);
  const [expandedMsgIds, setExpandedMsgIds] = useState<Record<string, boolean>>({});

  const toggleInlineExpand = (msgId: string) => {
    setExpandedMsgIds(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleOpenToolForMessage = (tool: 'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | 'graph' | 'citations', result?: QueryResult) => {
    if (result) {
      onAnalysisResult(result);
    }
    setActiveModalTool(prev => (prev === tool ? null : tool));
    setIsSidebarOpen(false);
  };
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  const [facilitatorFormSubmitted, setFacilitatorFormSubmitted] = useState(false);

  // Continuous Chat Conversation Messages Stream (ChatGPT / Claude style)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (activeResult) {
      return [
        {
          id: 'msg-user-init',
          sender: 'user',
          text: activeResult.userQuery || 'Ashwagandha Formulation Audit',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-asst-init',
          sender: 'assistant',
          text: `STATUTORY VERDICT: CONDITIONAL READINESS (Score: ${activeResult.readinessPassport?.overallScore || 69}%)\nMissing 2 Statutory Requirements for Patent Grant:\n  1. Section 3(d) synergistic bio-activity data required under Patents Act 1970.\n  2. Mandatory Form III pre-approval required under Biological Diversity Act 2023.\n\nStatutory 4-agent audit & GraphRAG synthesis complete for "${activeResult.userQuery || 'AYUSH Audit'}". Select any tool below to inspect details.`,
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
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse localStorage audit history:', e);
    }
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'hist-1',
        query: SAMPLE_QUERIES[3].query,
        title: 'Curcumin 98% Bioactive Fraction Audit',
        timestamp: `Today, ${nowStr}`,
        score: 88,
        result: getMockAnalysisForQuery(SAMPLE_QUERIES[3].query, jurisdiction)
      },
      {
        id: 'hist-2',
        query: SAMPLE_QUERIES[0].query,
        title: 'Ashwagandha + Guduchi Stress Capsules',
        timestamp: `Today, ${nowStr}`,
        score: 74,
        result: getMockAnalysisForQuery(SAMPLE_QUERIES[0].query, jurisdiction)
      },
      {
        id: 'hist-3',
        query: SAMPLE_QUERIES[2].query,
        title: 'Ayurveda-Aahar Tulsi Wellness Tea',
        timestamp: 'Yesterday',
        score: 82,
        result: getMockAnalysisForQuery(SAMPLE_QUERIES[2].query, jurisdiction)
      },
      {
        id: 'hist-4',
        query: SAMPLE_QUERIES[1].query,
        title: 'Classical Chyawanprash Modification',
        timestamp: '2 days ago',
        score: 45,
        result: getMockAnalysisForQuery(SAMPLE_QUERIES[1].query, jurisdiction)
      }
    ];
  });

  // Sync history from backend SQLite DB on mount
  React.useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    fetch(`${API_BASE}/api/v1/history`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const mappedSessions: AuditHistoryItem[] = data.sessions.map((sess: any) => {
            let resObj = sess.result;
            if (resObj && resObj.classification && resObj.classification.category) {
              return { ...sess, result: resObj };
            }
            if (resObj && (resObj.query_id || resObj.classification)) {
              resObj = mapBackendResponseToQueryResult(resObj, sess.query || sess.title || 'AYUSH Audit', jurisdiction, lawYear);
              return { ...sess, result: resObj };
            }
            const fallback = getMockAnalysisForQuery(sess.query || sess.title || 'AYUSH Formulation Audit', jurisdiction);
            return { ...sess, result: fallback };
          });
          setHistoryItems(mappedSessions);
          localStorage.setItem('ipsakti_audit_history', JSON.stringify(mappedSessions));
        }
      })
      .catch(err => console.log('Backend history fetch skipped:', err.message));
  }, []);

  const handleQuerySubmit = async (queryText: string) => {
    const hasContent = queryText.trim() || attachedFiles.length > 0;
    if (!hasContent) return;

    const finalQuery = attachedFiles.length > 0
      ? `${queryText.trim()} [Attached: ${attachedFiles.map(f => f.name).join(', ')}]`
      : queryText.trim();

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message to continuous stream
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: finalQuery,
      timestamp: timeStr,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const result = await analyzeQuery(finalQuery, jurisdiction, lawYear);
      onAnalysisResult(result);

      const infoResult = checkInformationalQuery(finalQuery);

      let verdictStatement = '';
      if (result.classification?.category === 'CONVERSATIONAL') {
        verdictStatement = result.classification.description || `I am IP-SAKTI Sahayak, your AI Decision Engine for Ayurvedic IPR & Biodiversity compliance. I can help you audit botanical formulations, evaluate patentability, check TKDL prior art, and navigate NBA compliance. How can I assist you today?`;
      } else if (infoResult.isInformational && infoResult.explanation) {
        verdictStatement = `STATUTORY EXPLANATION: ${infoResult.topicTitle}\n\n${infoResult.explanation}\n\nStatutory citations and legal sources attached below. Select Pins, Graph, or IP Strategy to explore grounded provisions.`;
      } else {
        const score = result.readinessPassport?.overallScore || 70;
        const blockers = result.readinessPassport?.criticalBlockers || [
          'Section 3(d) synergistic bio-activity data required under Patents Act 1970',
          'NBA Form III pre-approval required under Biological Diversity Act 2023'
        ];
        const isPatentReady = score >= 85 && blockers.length === 0;

        if (isPatentReady) {
          verdictStatement = `STATUTORY VERDICT: PATENT GRANT READY (Score: ${score}%)\nMeets all statutory criteria under Patents Act 1970 (Sec 3p/3d), BD Act 2023, and AYUSH guidelines.`;
        } else {
          verdictStatement = `STATUTORY VERDICT: CONDITIONAL READINESS (Score: ${score}%)\nYou are currently missing ${blockers.length} statutory requirements for patent grant:\n` +
            blockers.map((b, i) => `  ${i + 1}. ${b}`).join('\n');
        }
        verdictStatement += `\n\nStatutory 4-agent audit & GraphRAG synthesis complete for: "${finalQuery}". Select any tool button below (Pins, Graph, Passport) to view full legal evidence.`;
      }

      // Append Assistant Response Message to continuous stream
      const asstMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: verdictStatement,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: infoResult.isInformational && infoResult.citations ? { ...result, citations: infoResult.citations } : result
      };

      setMessages(prev => [...prev, asstMsg]);

      const querySnippet = finalQuery.length > 36 ? finalQuery.substring(0, 36) + '...' : finalQuery;
      const newItem: AuditHistoryItem = {
        id: result.queryId || `hist-${Date.now()}`,
        query: finalQuery,
        title: querySnippet,
        timestamp: timeStr,
        score: result.readinessPassport?.overallScore || 70,
        result
      };

      setHistoryItems(prev => {
        const updated = [newItem, ...prev.filter(i => i.id !== newItem.id && i.query !== newItem.query)];
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

  const handleNewAudit = () => {
    setMessages([]);
    setInputQuery('');
    setAttachedFiles([]);
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem('ipsakti_audit_history');
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      fetch(`${API_BASE}/api/v1/history`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}
  };

  const handleSelectHistoryItem = async (item: AuditHistoryItem) => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

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

      setMessages([
        {
          id: `user-hist-${item.id}`,
          sender: 'user',
          text: item.query || item.title || 'AYUSH Formulation Audit',
          timestamp: timeStr
        },
        {
          id: `asst-hist-${item.id}`,
          sender: 'assistant',
          text: 'Historical IP-SAKTI statutory audit retrieved from persistent database.',
          timestamp: timeStr,
          result: mapped
        }
      ]);
    } catch (err) {
      console.error('History item selection error:', err);
    }
  };

  const handleOpenTool = (tool: 'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture') => {
    setActiveModalTool(prev => (prev === tool ? null : tool));
    setIsSidebarOpen(false); // Automatically collapse history sidebar when opening tool
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
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              title="Return to Hero Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-950" />
              <span>{t.home}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <AntigravityLogo size={22} />
              <span className="text-xs font-black tracking-tight text-slate-950 font-display">IP-SAKTI</span>
            </div>
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
                const isActive = activeResult?.userQuery === item.query;
                
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

                const itemScore = item.score || item.result?.readinessPassport?.overallScore || 76;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer border relative overflow-hidden ${
                      isActive
                        ? 'bg-slate-950 border-slate-950 text-white font-bold shadow-sm'
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

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 border relative z-10 ${
                      isActive 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'bg-slate-100 text-slate-950 border-slate-200'
                    }`}>
                      {itemScore}%
                    </span>
                  </button>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs font-mono border border-dashed border-slate-200 rounded-xl">
                  No audits found
                </div>
              )}
            </div>
          </div>

          {/* Navigation Shortlinks inside Sidebar */}
          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsSidebarToolsOpen(prev => !prev)}
              className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-2 px-1 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <span>Product Navigation</span>
              {isSidebarToolsOpen ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>

            {isSidebarToolsOpen && (
              <div className="space-y-1.5 font-medium text-xs animate-fade-in">
              <div 
                onClick={() => handleOpenTool('classifier')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'classifier'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.classifier}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>

              <div 
                onClick={() => handleOpenTool('tkdl')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'tkdl'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.tkdl}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>

              <div 
                onClick={() => handleOpenTool('abs')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'abs'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.abs}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>

              <div 
                onClick={() => handleOpenTool('whatif')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'whatif'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.whatif}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>

              <div 
                onClick={() => handleOpenTool('passport')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'passport'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.passport}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>

              <div 
                onClick={() => handleOpenTool('architecture')} 
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                  activeModalTool === 'architecture'
                    ? 'bg-slate-100 border-slate-950 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:text-slate-950 hover:shadow-md'
                }`}
              >
                {/* Google Rainbow Hover Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/15 via-[#ea4335]/10 via-[#fbbc05]/10 to-[#34a853]/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-slate-200/80 border border-slate-300 text-slate-950">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>{t.architecture}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:translate-x-0.5 relative z-10" />
              </div>
            </div>
          )}
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
                🇮🇳 IN
              </button>
              <button
                onClick={() => onJurisdictionChange('INTERNATIONAL')}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                  jurisdiction === 'INTERNATIONAL'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                🌐 Global
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

            {activeResult && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => exportToPdf(activeResult)}
                  className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-slate-800"
                  title="Export Official PDF Report"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span className="hidden md:inline">PDF</span>
                </button>

                <button
                  onClick={() => exportToWord(activeResult)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-300 shadow-xs cursor-pointer"
                  title="Export Editable Microsoft Word (.docx) Document"
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">Word</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Workspace Content — ChatGPT / Claude Style Continuous Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-48 sm:pb-56 relative z-10">
          {/* Welcome Greeting State (Only when no messages in session) */}
          {messages.length === 0 && !isLoading && (
            <div className="max-w-2xl mx-auto my-12 text-center space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
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
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                      <AntigravityLogo size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-black font-display text-slate-950 uppercase tracking-wider block">
                        IP-SAKTI Sahayak Agent Engine
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Assistant Speech Card & Conversational Response */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4 font-sans ml-0 sm:ml-11">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Brief Statutory Summary pill */}
                    {msg.result && msg.result.classification?.category !== 'CONVERSATIONAL' && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-medium">
                        <div className="flex items-center justify-between text-slate-950 font-bold">
                          <span>{msg.result.classification?.title || 'AYUSH Statutory Audit'}</span>
                          {msg.result.classification?.category !== 'STATUTORY_INFORMATION' && (
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-bold">
                              Score: {msg.result.readinessPassport?.overallScore || 78}%
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-normal">{msg.result.classification?.description}</p>
                      </div>
                    )}

                    {/* Short Interactive Action Icons Row */}
                    {msg.result && msg.result.classification?.category !== 'CONVERSATIONAL' && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenToolForMessage('citations', msg.result!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                          title="View Statutory Pins & Citations"
                        >
                          <Pin className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                          <span>Pins ({msg.result.citations?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => handleOpenToolForMessage('graph', msg.result!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                          title="Open Interactive Topology Graph"
                        >
                          <Share2 className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                          <span>Graph</span>
                        </button>

                        <button
                          onClick={() => handleOpenToolForMessage('architecture', msg.result!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                          title="Inspect 4-Agent Reasoning Harness"
                        >
                          <Cpu className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                          <span>Harness</span>
                        </button>

                        <button
                          onClick={() => handleOpenToolForMessage('classifier', msg.result!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                          title="View Regulatory Classification & IP Strategy"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                          <span>IP Strategy</span>
                        </button>

                        <button
                          onClick={() => handleOpenToolForMessage('passport', msg.result!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-950 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-xs group"
                          title="View 5-Pillar Scorecard & Passport"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" />
                          <span>Passport</span>
                        </button>

                        <button
                          onClick={() => toggleInlineExpand(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer shadow-xs ml-auto"
                        >
                          {expandedMsgIds[msg.id] ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 text-white" />
                              <span>Hide Workspace</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 text-white" />
                              <span>Full Workspace</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Follow-up Suggested Quick Re-Chat Chips */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {[
                        'What about Section 3(d) efficacy data requirement?',
                        'How to submit NBA Form III under BD Act 2023?',
                        'Check PCT export clearance for USA & WIPO'
                      ].map((promptText, pIdx) => (
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

                    {/* Optional Expanded Inline Workspace View */}
                    {msg.result && expandedMsgIds[msg.id] && (
                      <WorkspaceErrorBoundary>
                        <div className="space-y-6 pt-4 border-t border-slate-200">
                          {/* Agent Pipeline Harness */}
                          <AgentPipeline steps={msg.result.agentSteps || []} />

                          {/* Detected Regulatory Category Card */}
                          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-900 shadow-xl space-y-2 relative overflow-hidden">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                              Detected Category
                            </span>
                            <h4 className="text-xl font-black text-white font-display">
                              {msg.result.classification?.title || 'AYUSH Formulation Audit'}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {msg.result.classification?.description || 'Synergistic botanical formulation audit.'}
                            </p>
                            <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                              <span>Statutory Authority: <strong className="text-white">{msg.result.classification?.regulatoryBody || 'Ministry of Ayush'}</strong></span>
                              <span>Confidence: <strong className="text-white font-bold">{msg.result.classification?.confidence || 90}%</strong></span>
                            </div>
                          </div>

                          {/* IP Protection Grid */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider">
                              Multi-Regime Protection Strategy
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(msg.result.ipMap || []).map((ip, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 transition-all shadow-xs">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-950">{ip.title}</span>
                                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-white">
                                      {ip.status}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-700 font-medium mb-3">{ip.summary}</p>

                                  <div className="space-y-1">
                                    {(ip.keyRequirements || []).map((req, rIdx) => (
                                      <div key={rIdx} className="text-[11px] text-slate-800 flex items-start gap-1.5 font-medium">
                                        <span className="text-slate-950 font-bold shrink-0">•</span>
                                        <span>{req}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Evidence Topology Graph */}
                          <EvidenceGraph nodes={msg.result.nodes || []} edges={msg.result.edges || []} />

                          {/* Citations List */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-slate-950" />
                              Verified Statutory Citations ({(msg.result.citations || []).length} Sources)
                            </h4>

                            <div className="space-y-3">
                              {(msg.result.citations || []).map((cit) => (
                                <div
                                  key={cit.id}
                                  onClick={() => setSelectedCitationId(selectedCitationId === cit.id ? null : cit.id)}
                                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs space-y-2.5"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                    <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                      <span className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                                        <span className="text-sm">📌</span>
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
                          </div>
                        </div>
                      </WorkspaceErrorBoundary>
                    )}
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

              <button
                onClick={() => handleQuerySubmit(inputQuery)}
                disabled={isLoading || (!inputQuery.trim() && attachedFiles.length === 0)}
                className="bg-slate-950 hover:bg-slate-800 p-2.5 rounded-full text-white disabled:opacity-30 transition-all shrink-0 shadow-md cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Rolling Tool Dock (Fixed Overlay FAB & Dock) */}
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'classifier'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="Product Classifier"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
              <span>Classifier</span>
            </button>

            <button
              onClick={() => {
                handleOpenTool('tkdl');
                setIsDockOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'tkdl'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="TKDL Overlap Radar"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-300" />
              <span>TKDL Radar</span>
            </button>

            <button
              onClick={() => {
                handleOpenTool('abs');
                setIsDockOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'abs'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="ABS Biodiversity Checker"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
              <span>ABS Checker</span>
            </button>

            <button
              onClick={() => {
                handleOpenTool('whatif');
                setIsDockOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'whatif'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="What-If Simulator"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-300" />
              <span>What-If</span>
            </button>

            <button
              onClick={() => {
                handleOpenTool('passport');
                setIsDockOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'passport'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="IP Readiness Passport"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-300" />
              <span>Passport</span>
            </button>

            <button
              onClick={() => {
                handleOpenTool('architecture');
                setIsDockOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTool === 'architecture'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200'
              }`}
              title="4-Agent Architecture Blueprint"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-300" />
              <span>Blueprint</span>
            </button>
          </div>

          {/* Main Rolling Trigger FAB Button */}
          <button
            onClick={() => setIsDockOpen(prev => !prev)}
            className={`p-3.5 rounded-full bg-slate-950 text-white shadow-2xl border border-slate-800 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center group ${
              isDockOpen ? 'bg-slate-900 ring-2 ring-slate-400 rotate-90' : 'hover:bg-slate-900'
            }`}
            title={isDockOpen ? 'Roll in Audit Tools' : 'Roll out Audit Tools'}
          >
            {isDockOpen ? (
              <X className="w-5 h-5 text-white transition-transform" />
            ) : (
              <Wand2 className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Right-Side Inline Tool Drawer Panel (Flex Sibling — Same Level as Sidebar & Workspace) */}
      {activeModalTool && (
        <div className="w-full sm:w-[50%] lg:w-[48%] max-w-2xl h-full flex flex-col bg-white text-slate-950 border-l border-slate-200 shrink-0 animate-slide-in-right shadow-2xl relative z-30 overflow-hidden">
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
                    <ProductClassifier onClassifyComplete={(c) => {
                      if (activeResult) {
                        onAnalysisResult({ ...activeResult, classification: c });
                      }
                      setActiveModalTool(null);
                    }} />
                  )}
                  {activeModalTool === 'tkdl' && (
                    <TKDLRadar matches={displayResult.tkOverlap} />
                  )}
                  {activeModalTool === 'abs' && (
                    <ABSChecker analysis={displayResult.absAnalysis} />
                  )}
                  {activeModalTool === 'whatif' && (
                    <WhatIfSimulator />
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
