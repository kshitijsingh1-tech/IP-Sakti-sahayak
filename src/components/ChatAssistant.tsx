import React, { useState } from 'react';
import type { QueryResult, Jurisdiction, AuditHistoryItem, SampleQuery } from '../types';
import { SAMPLE_QUERIES, getMockAnalysisForQuery } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { analyzeQuery, mapBackendResponseToQueryResult } from '../services/aiEngine';
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
import { 
  Send, BookOpen, RefreshCw, Plus, Search, 
  PanelLeftClose, PanelLeftOpen, ShieldCheck, 
  Sparkles, Download, ChevronRight, Home, ArrowLeft,
  Sliders, FileCheck, Cpu, X, UserCheck, CheckCircle2, AlertCircle
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
  const [activeModalTool, setActiveModalTool] = useState<'classifier' | 'tkdl' | 'abs' | 'whatif' | 'passport' | 'architecture' | null>(null);
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  const [facilitatorFormSubmitted, setFacilitatorFormSubmitted] = useState(false);

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
    setIsLoading(true);

    const finalQuery = attachedFiles.length > 0
      ? `${queryText.trim()} [Attached: ${attachedFiles.map(f => f.name).join(', ')}]`
      : queryText.trim();

    try {
      const result = await analyzeQuery(finalQuery, jurisdiction, lawYear);
      onAnalysisResult(result);

      const querySnippet = finalQuery.length > 36 ? finalQuery.substring(0, 36) + '...' : finalQuery;
      const newItem: AuditHistoryItem = {
        id: result.queryId || `hist-${Date.now()}`,
        query: finalQuery,
        title: querySnippet,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      setInputQuery('');
      setAttachedFiles([]);
    }
  };

  const handleNewAudit = () => {
    setInputQuery('');
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
    // Only auto-collapse history sidebar on mobile screens (< 768px)
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      if (item.result) {
        const mapped = mapBackendResponseToQueryResult(
          item.result as any,
          item.query || item.title || 'AYUSH Formulation Audit',
          jurisdiction,
          lawYear
        );
        onAnalysisResult(mapped);
        return;
      }

      const mockRes = getMockAnalysisForQuery(item.query || item.title || 'AYUSH Formulation Audit', jurisdiction);
      onAnalysisResult(mockRes);
    } catch (err) {
      console.error('History item selection error:', err);
      const fallback = getMockAnalysisForQuery(item.query || item.title || 'AYUSH Formulation Audit', jurisdiction);
      onAnalysisResult(fallback);
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
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-2 px-1">
              Product Navigation
            </span>

            <div className="space-y-1.5 font-medium text-xs">
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
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span className="hidden md:inline">Export Passport PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Workspace Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-48 sm:pb-56 relative z-10">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xl">
              <div className="w-10 h-10 border-3 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-950 font-display">Executing Autonomous Agent Audit...</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
                Researcher ➔ Auditor ➔ Devil's Advocate ➔ Strategist scanning statutory vector database and classical TKDL corpora.
              </p>
            </div>
          )}

          {/* Active Audit Results */}
          {!isLoading && activeResult && (
            <WorkspaceErrorBoundary>
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Agent Pipeline Harness */}
                <AgentPipeline steps={activeResult.agentSteps || []} />

                {/* Detected Regulatory Category Card — Matte Black */}
                <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-900 shadow-xl space-y-2 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Detected Category
                  </span>
                  <h4 className="text-xl font-black text-white font-display">
                    {activeResult.classification?.title || 'AYUSH Formulation Audit'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {activeResult.classification?.description || 'Synergistic botanical formulation audit.'}
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>Statutory Authority: <strong className="text-white">{activeResult.classification?.regulatoryBody || 'Ministry of Ayush'}</strong></span>
                    <span>Confidence: <strong className="text-white font-bold">{activeResult.classification?.confidence || 90}%</strong></span>
                  </div>
                </div>

                {/* IP Protection Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider">
                    Multi-Regime Protection Strategy
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(activeResult.ipMap || []).map((ip, idx) => (
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
                <EvidenceGraph nodes={activeResult.nodes || []} edges={activeResult.edges || []} />

                {/* Citations List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-950" />
                    Verified Statutory Citations ({(activeResult.citations || []).length} Sources)
                  </h4>

                  <div className="space-y-2">
                    {(activeResult.citations || []).map((cit) => (
                      <div
                        key={cit.id}
                        onClick={() => setSelectedCitationId(selectedCitationId === cit.id ? null : cit.id)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-950">{cit.statuteOrSource}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200 font-bold">
                              {cit.provision}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-950 font-bold">
                            {cit.confidenceScore}% Grounded
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 italic font-medium">"{cit.excerpt}"</p>

                        {selectedCitationId === cit.id && (
                          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-700 space-y-1 font-medium">
                            <p>Authority: <strong className="text-slate-950">{cit.authorityLevel}</strong></p>
                            <p>Effective Date: <strong className="text-slate-950">{cit.yearOrVersion}</strong></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escalation Card — Matte Black */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                      <h5 className="text-xs font-black font-display text-slate-950 uppercase tracking-wider">
                        Require Expert Statutory Consultation?
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Escalate to AYUSH Patent Attorney or NBA ABS Nodal Officer for official filing support.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsFacilitatorModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer hover:shadow-lg"
                  >
                    Connect with IP Facilitator
                  </button>
                </div>
              </div>
            </WorkspaceErrorBoundary>
          )}

          {/* Welcome Greeting State */}
          {!isLoading && !activeResult && (
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
                    className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all group shadow-xs"
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
      </div>

      {/* Right-Side Inline Tool Drawer Panel (Flex Sibling — Same Level as Sidebar & Workspace) */}
      {activeModalTool && (
        <div className="w-full sm:w-[50%] lg:w-[48%] max-w-2xl h-full flex flex-col bg-white text-slate-950 border-l border-slate-200 shrink-0 animate-slide-in-right shadow-2xl relative z-30 overflow-hidden">
          {/* Google 4-Color Rainbow Ambient Background Halo */}
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-gradient-to-r from-[#4285f4]/20 via-[#ea4335]/15 via-[#fbbc05]/15 to-[#34a853]/20 blur-3xl pointer-events-none rounded-full" />

          {/* Drawer Header with Guidance & Close */}
          <div className="p-4 bg-white/90 backdrop-blur-xl flex items-center justify-between border-b border-slate-200 shrink-0 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                {activeModalTool === 'classifier' && <Sparkles className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'tkdl' && <BookOpen className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'abs' && <ShieldCheck className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'whatif' && <Sliders className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'passport' && <FileCheck className="w-5 h-5 text-slate-950" />}
                {activeModalTool === 'architecture' && <Cpu className="w-5 h-5 text-slate-950" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black font-display text-slate-950 truncate">
                  {activeModalTool === 'classifier' && 'Regulatory Classifier'}
                  {activeModalTool === 'tkdl' && 'TKDL Prior-Art Radar'}
                  {activeModalTool === 'abs' && 'ABS Duty Checker'}
                  {activeModalTool === 'whatif' && 'What-If Simulator'}
                  {activeModalTool === 'passport' && 'Readiness Passport'}
                  {activeModalTool === 'architecture' && 'Architecture Inspector'}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium truncate">
                  {activeModalTool === 'classifier' && '💡 Categorize under SLA 25D, CDSCO, or FSSAI'}
                  {activeModalTool === 'tkdl' && '💡 Review Section 3(p) prior art overlap'}
                  {activeModalTool === 'abs' && '💡 Complete NBA Form III requirements'}
                  {activeModalTool === 'whatif' && '💡 Adjust parameters to test score impact'}
                  {activeModalTool === 'passport' && '💡 Review 5-pillar scorecards & export PDF'}
                  {activeModalTool === 'architecture' && '💡 Inspect 4-Agent RAG pipeline traces'}
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
                    <ReadinessPassport passport={displayResult.readinessPassport} />
                  )}
                  {activeModalTool === 'architecture' && (
                    <ArchitectureView />
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
