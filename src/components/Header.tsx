import React from 'react';
import type { Jurisdiction } from '../types';
import { AntigravityLogo } from './AntigravityLogo';
import { Sparkles, Home, Rocket } from 'lucide-react';

import { TRANSLATIONS } from '../data/translations';
import { triggerGoogleTranslate } from '../services/translator';

interface HeaderProps {
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (j: Jurisdiction) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  lawYear?: string;
  onLawYearChange?: (year: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  jurisdiction,
  onJurisdictionChange,
  selectedLanguage,
  onLanguageChange,
  activeTab,
  onTabChange,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['en'];

  return (
    <header className="sticky top-0 z-50 px-2 sm:px-4 pt-3 pb-2 transition-all">
      {/* Floating Capsule Bar — Clean, Larger Font & Uncluttered Header */}
      <div className="max-w-7xl mx-auto rounded-full bg-white/95 backdrop-blur-2xl p-2 px-4 sm:px-5 border border-slate-200/90 shadow-xl flex items-center justify-between gap-3 overflow-hidden google-shimmer-border">
        {/* Left Brand Identity — Prominent IP-SAKTI Sahayak */}
        <div 
          onClick={() => onTabChange('hero')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <AntigravityLogo size={36} />

          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black font-display tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors">
              {t.appTitle}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-white font-black">
              SIH 26045
            </span>
          </div>
        </div>

        {/* Minimal Uncluttered Top Bar */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onTabChange('hero')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 text-xs ${
              activeTab === 'hero'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </button>
          
          <button
            onClick={() => onTabChange('assistant')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 text-xs ${
              activeTab === 'assistant'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.assistant}</span>
          </button>
        </div>

        {/* Right Tools Controls — Larger Fonts & Clear Touch Targets */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          {/* Dual Jurisdiction Pill */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-300">
            <button
              onClick={() => onJurisdictionChange('INDIA')}
              className={`px-3 py-1 rounded-full font-extrabold text-xs transition-all ${
                jurisdiction === 'INDIA'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              🇮🇳 IN
            </button>
            <button
              onClick={() => onJurisdictionChange('INTERNATIONAL')}
              className={`px-3 py-1 rounded-full font-extrabold text-xs transition-all ${
                jurisdiction === 'INTERNATIONAL'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              🌐 Global
            </button>
          </div>

          {/* Language Selector Pill */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const lang = e.target.value;
              onLanguageChange(lang);
              triggerGoogleTranslate(lang);
            }}
            className="bg-slate-100 text-slate-950 font-extrabold rounded-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="sa">संस्कृतम्</option>
            <option value="ta">தமிழ்</option>
          </select>

          {/* Primary Action Button */}
          <button
            onClick={() => onTabChange('assistant')}
            className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
          >
            <Rocket className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Launch Remote</span>
          </button>
        </div>
      </div>
    </header>
  );
};
