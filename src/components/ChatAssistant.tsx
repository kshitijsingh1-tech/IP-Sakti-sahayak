import React, { useState } from 'react';
import type { QueryResult, Jurisdiction, AuditHistoryItem } from '../types';
import { SAMPLE_QUERIES } from '../data/mockData';
import { analyzeQuery } from '../services/aiEngine';
import { AgentPipeline } from './AgentPipeline';
import { EvidenceGraph } from './EvidenceGraph';
import { AntigravityLogo } from './AntigravityLogo';
import { FileUploadTrigger, FileChipsList, type UploadedFile } from './FileUploadButton';
import { 
  Send, BookOpen, UserCheck, RefreshCw, Plus, Search, 
  PanelLeftClose, PanelLeftOpen, ShieldCheck, 
  Sparkles, Download, FileText, ChevronRight, Home, ArrowLeft
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
  const [inputQuery, setInputQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Sample Audit History Items
  const [historyItems, setHistoryItems] = useState<AuditHistoryItem[]>([
    {
      id: 'hist-1',
      query: SAMPLE_QUERIES[0].query,
      title: SAMPLE_QUERIES[0].title,
      timestamp: 'Today, 7:45 PM',
      score: 88,
      result: activeResult!
    },
    {
      id: 'hist-2',
      query: SAMPLE_QUERIES[1].query,
      title: SAMPLE_QUERIES[1].title,
      timestamp: 'Yesterday',
      score: 74,
      result: activeResult!
    },
    {
      id: 'hist-3',
      query: SAMPLE_QUERIES[2].query,
      title: SAMPLE_QUERIES[2].title,
      timestamp: '3 days ago',
      score: 92,
      result: activeResult!
    },
    {
      id: 'hist-4',
      query: SAMPLE_QUERIES[3].query,
      title: SAMPLE_QUERIES[3].title,
      timestamp: '1 week ago',
      score: 95,
      result: activeResult!
    }
  ]);

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

      const newItem: AuditHistoryItem = {
        id: `hist-${Date.now()}`,
        query: finalQuery,
        title: finalQuery.length > 32 ? finalQuery.substring(0, 32) + '...' : finalQuery,
        timestamp: 'Just now',
        score: result.readinessPassport.overallScore,
        result
      };
      setHistoryItems(prev => [newItem, ...prev]);
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

  const handleSelectHistoryItem = (item: AuditHistoryItem) => {
    onAnalysisResult(item.result);
  };

  const filteredHistory = historyItems.filter(item => 
    item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-950 flex overflow-hidden font-sans selection:bg-slate-800 selection:text-white">
      {/* Matte Black Left Navigation & History Sidebar */}
      <div 
        className={`bg-slate-950 text-white transition-all duration-300 flex flex-col z-20 shrink-0 border-r border-slate-800 ${
          isSidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Top Header with Back to Home & + New Audit Button */}
        <div className="p-3 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('hero')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-slate-800"
              title="Return to Hero Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-1.5">
              <AntigravityLogo size={22} />
              <span className="text-xs font-black tracking-tight text-white font-display">IP-SAKTI</span>
            </div>
          </div>

          <button
            onClick={handleNewAudit}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-between transition-all shadow-md border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-950" />
              <span>New Formulation Audit</span>
            </div>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-950 font-bold">Ctrl N</kbd>
          </button>

          {/* Audit History Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search audit history..."
              className="w-full bg-slate-900 text-white text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-800 focus:outline-none focus:border-white placeholder:text-slate-500 font-medium"
            />
          </div>
        </div>

        {/* Audit History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-2 px-1">
              Recent Audits
            </span>

            <div className="space-y-1">
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                    activeResult?.userQuery === item.query
                      ? 'bg-white text-slate-950 font-bold shadow-xs'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className={`text-xs font-bold block truncate ${activeResult?.userQuery === item.query ? 'text-slate-950' : 'text-slate-200 group-hover:text-white'}`}>
                      {item.title}
                    </span>
                    <span className={`text-[10px] font-mono block ${activeResult?.userQuery === item.query ? 'text-slate-600' : 'text-slate-400'}`}>
                      {item.timestamp}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeResult?.userQuery === item.query 
                      ? 'bg-slate-950 text-white' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}>
                    {item.score}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Shortlinks inside Sidebar */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-2 px-1">
              Product Navigation
            </span>

            <div className="space-y-1 text-xs text-slate-300 font-medium">
              <div onClick={() => onNavigateTab('classifier')} className="p-2 rounded-lg hover:bg-slate-900 flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Classifier Wizard</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>

              <div onClick={() => onNavigateTab('tkdl')} className="p-2 rounded-lg hover:bg-slate-900 flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                  <span>TKDL Sanskrit Radar</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>

              <div onClick={() => onNavigateTab('abs')} className="p-2 rounded-lg hover:bg-slate-900 flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>NBA ABS Duty</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>

              <div onClick={() => onNavigateTab('passport')} className="p-2 rounded-lg hover:bg-slate-900 flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>IP Readiness Passport</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* User Storage Badge Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-bold text-white">IP-SAKTI Storage</span>
          </div>
          <span>4 Audits Saved</span>
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
              <span>Hero Home</span>
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
              onChange={(e) => onLanguageChange(e.target.value)}
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
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Agent Pipeline Harness */}
              <AgentPipeline steps={activeResult.agentSteps} />

              {/* Detected Regulatory Category Card — Matte Black */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-900 shadow-xl space-y-2 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Detected Category
                </span>
                <h4 className="text-xl font-black text-white font-display">
                  {activeResult.classification.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {activeResult.classification.description}
                </p>
                <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span>Statutory Authority: <strong className="text-white">{activeResult.classification.regulatoryBody}</strong></span>
                  <span>Confidence: <strong className="text-white font-bold">{activeResult.classification.confidence}%</strong></span>
                </div>
              </div>

              {/* IP Protection Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider">
                  Multi-Regime Protection Strategy
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeResult.ipMap.map((ip, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 transition-all shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-950">{ip.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-white">
                          {ip.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mb-3">{ip.summary}</p>

                      <div className="space-y-1">
                        {ip.keyRequirements.map((req, rIdx) => (
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
              <EvidenceGraph nodes={activeResult.nodes} edges={activeResult.edges} />

              {/* Citations List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-950" />
                  Verified Statutory Citations ({activeResult.citations.length} Sources)
                </h4>

                <div className="space-y-2">
                  {activeResult.citations.map((cit) => (
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
              <div className="p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between flex-wrap gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-950">Escalate to AYUSH IP Facilitator Cell</h5>
                    <p className="text-[11px] text-slate-600 font-medium">Request official patent agent representation or statutory filing assistance.</p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Escalated case to Ministry of Ayush IP Facilitation Cell. Case ID: AYUSH-IP-8842')}
                  className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md"
                >
                  Connect with IP Facilitator
                </button>
              </div>
            </div>
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
                {SAMPLE_QUERIES.map((sq) => (
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
                placeholder={attachedFiles.length > 0 ? 'Add context or submit attached files...' : 'Ask IP-SAKTI Sahayak or describe formulation for instant audit...'}
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
    </div>
  );
};
