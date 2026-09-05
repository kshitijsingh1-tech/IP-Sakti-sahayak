import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Normalize raw HTML break tags to standard markdown newlines
  const sanitizedContent = (content || '').replace(/<br\s*\/?>/gi, '\n\n');

  return (
    <div className={`prose-ipsakti leading-relaxed text-slate-800 font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-black font-display text-slate-950 mt-4 mb-2 pb-1.5 border-b border-slate-200 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold font-display text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold font-display text-slate-900 mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-2.5 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 mb-3 text-xs sm:text-sm text-slate-700 font-medium marker:text-slate-900">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 mb-3 text-xs sm:text-sm text-slate-700 font-medium marker:text-slate-900">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-800">{children}</em>
          ),
          hr: () => (
            <hr className="my-4 border-slate-200" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-emerald-600 pl-3.5 py-1.5 my-3 bg-emerald-50/50 rounded-r-xl text-slate-800 italic text-xs sm:text-sm shadow-xs">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/90 text-slate-950 border-b border-slate-200 font-display">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/80 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3.5 font-bold text-slate-900 text-xs tracking-wider uppercase font-sans">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2.5 px-3.5 text-slate-700 text-xs leading-relaxed font-medium align-top">
              {children}
            </td>
          ),
          code: ({ children, className }) => {
            const isCodeBlock = className && className.includes('language-');
            if (isCodeBlock) {
              return (
                <code className="block p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto my-2 border border-slate-800 leading-normal">
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-900 font-mono text-[11px] font-bold border border-slate-200">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 p-0 bg-transparent overflow-x-auto rounded-xl">
              {children}
            </pre>
          )
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};
