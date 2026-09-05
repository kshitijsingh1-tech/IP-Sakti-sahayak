import { useState } from 'react';
import type { Jurisdiction, QueryResult, ProductClassificationResult } from './types';
import { getMockAnalysisForQuery } from './data/mockData';
import { analyzeQuery } from './services/aiEngine';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ChatAssistant } from './components/ChatAssistant';
import { ProductClassifier } from './components/ProductClassifier';
import { TKDLRadar } from './components/TKDLRadar';
import { ABSChecker } from './components/ABSChecker';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ReadinessPassport } from './components/ReadinessPassport';
import { ArchitectureView } from './components/ArchitectureView';
import { HelpDrawer } from './components/HelpDrawer';

export function App() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('INDIA');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [lawYear, setLawYear] = useState<string>('2024');
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);

  const handleJurisdictionChange = async (j: Jurisdiction) => {
    setJurisdiction(j);
    if (activeResult) {
      const updated = await analyzeQuery(activeResult.userQuery, j, lawYear);
      setActiveResult(updated);
    }
  };

  const handleLawYearChange = async (year: string) => {
    setLawYear(year);
    if (activeResult) {
      const updated = await analyzeQuery(activeResult.userQuery, jurisdiction, year);
      setActiveResult(updated);
    }
  };

  const handleClassifyComplete = (classification: ProductClassificationResult) => {
    if (activeResult) {
      const updated = { ...activeResult, classification };
      setActiveResult(updated);
    }
    setActiveTab('assistant');
  };

  const handleStartQuery = async (queryText: string) => {
    setActiveTab('assistant');
    const res = await analyzeQuery(queryText, jurisdiction, lawYear);
    setActiveResult(res);
  };

  return (
    <div className="min-h-screen antigravity-bg text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Floating Header Capsule — Rendered on Hero & Non-Chat Pages ONLY */}
      {activeTab !== 'assistant' && (
        <Header
          jurisdiction={jurisdiction}
          onJurisdictionChange={handleJurisdictionChange}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          lawYear={lawYear}
          onLawYearChange={handleLawYearChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* Main Content Area — Fullscreen View for Assistant Chat Workspace */}
      <main className={activeTab === 'assistant' ? 'w-full h-screen overflow-hidden p-0 m-0' : 'flex-1 max-w-7xl w-full mx-auto px-4 py-4'}>
        {activeTab === 'hero' && (
          <LandingHero
            onStartQuery={handleStartQuery}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'assistant' && (
          <ChatAssistant
            jurisdiction={jurisdiction}
            onJurisdictionChange={handleJurisdictionChange}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onAnalysisResult={setActiveResult}
            activeResult={activeResult}
            lawYear={lawYear}
            onNavigateTab={setActiveTab}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        )}

        {(() => {
          const displayResult = activeResult || getMockAnalysisForQuery('Ashwagandha Extract Formulation', jurisdiction);
          return (
            <>
              {activeTab === 'classifier' && (
                <ProductClassifier
                  onClassifyComplete={handleClassifyComplete}
                  onSendToChat={() => {
                    setActiveTab('assistant');
                  }}
                />
              )}

              {activeTab === 'tkdl' && (
                <TKDLRadar matches={displayResult.tkOverlap} />
              )}

              {activeTab === 'abs' && (
                <ABSChecker analysis={displayResult.absAnalysis} />
              )}

              {activeTab === 'whatif' && (
                <WhatIfSimulator
                  onSendToChat={() => {
                    setActiveTab('assistant');
                  }}
                />
              )}

              {activeTab === 'passport' && (
                <ReadinessPassport passport={displayResult.readinessPassport} />
              )}

              {activeTab === 'architecture' && (
                <ArchitectureView />
              )}
            </>
          );
        })()}
      </main>

      {/* Light Theme Footer — Hidden on Fullscreen Chat Page */}
      {activeTab !== 'assistant' && (
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl py-8 text-center text-xs text-slate-600 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-extrabold text-slate-950">IP-SAKTI Sahayak</span>
            </div>
            <p className="text-slate-600 font-medium">
              Built for AYUSH Practitioners, MSMEs & Researchers • Grounded in Patents Act 1970/2024, BD Act 2023 & WIPO GRATK 2024
            </p>
            <div className="font-mono text-[11px] text-blue-700 font-bold">
              Autonomous AYUSH RAG Engine • Dual Jurisdiction
            </div>
          </div>
        </footer>
      )}

      {/* Global Interactive Help & Statutory Knowledge Base Drawer */}
      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onNavigateTab={(tab) => {
          setIsHelpOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default App;
