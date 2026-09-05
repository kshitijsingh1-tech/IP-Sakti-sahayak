import React, { useState, useRef, useEffect } from 'react';
import { Download, FileCheck, ChevronDown, X } from 'lucide-react';
import type { QueryResult } from '../types';
import { exportToPdf, exportToWord } from '../utils/exportUtils';

interface ExportRolloutButtonProps {
  result: QueryResult;
  className?: string;
  label?: string;
}

export const ExportRolloutButton: React.FC<ExportRolloutButtonProps> = ({
  result,
  className = '',
  label = 'Download'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Roll back in when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportPdf = () => {
    exportToPdf(result);
    setIsOpen(false);
  };

  const handleExportWord = () => {
    exportToWord(result);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:scale-105 cursor-pointer border border-slate-900 group"
          title="Download Report (PDF or Word)"
        >
          <Download className="w-3.5 h-3.5 text-white group-hover:-translate-y-0.5 transition-transform" />
          <span>{label}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-300 shadow-xl animate-in fade-in zoom-in-95 duration-200 ring-2 ring-slate-950/10">
          {/* PDF Option */}
          <button
            onClick={handleExportPdf}
            className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-900"
            title="Download Official PDF Report"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>PDF</span>
          </button>

          {/* Word Option */}
          <button
            onClick={handleExportWord}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-300 shadow-xs cursor-pointer"
            title="Download Editable Word Document (.docx)"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Word</span>
          </button>

          {/* Roll back in / Collapse button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Collapse / Roll back in"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
