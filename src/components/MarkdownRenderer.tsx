import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Normalizes and repairs common LLM markdown artifacts:
 * 1. Splits merged table rows where row boundary became "| |" on the same line.
 * 2. Ensures table delimiters (|---|---|) are isolated on their own line.
 * 3. Heals multiline broken table rows by rejoining orphaned cell lines with <br />.
 * 4. Normalizes isolated bullet points inside cells.
 */
function normalizeMarkdown(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Separate merged rows with "| |" on the same line into distinct rows:
  // e.g. "... FTO opinion. | | 2️⃣ Technical Development | ..." -> "... FTO opinion. |\n| 2️⃣ Technical Development | ..."
  text = text.replace(/\|[ \t]+\|[ \t]*/g, '|\n| ');

  // 2. Ensure table delimiter rows (e.g. |---|---|) have proper newlines before and after
  text = text.replace(/([^\n])\n?(\|(?:\s*[:-]+-+\s*\|)+)/g, '$1\n$2');

  // 3. Heal multiline broken table rows:
  // When an LLM outputs newlines inside a table cell, it breaks GFM table parsing.
  // We detect table sections and rejoin orphaned lines into the active row using '<br />'.
  const lines = text.split('\n');
  const result: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const isDelimiter = /^\|(?:\s*[:-]+-+\s*\|)+$/.test(trimmed);
    const startsWithPipe = trimmed.startsWith('|');
    const endsWithPipe = trimmed.endsWith('|');

    if (isDelimiter) {
      inTable = true;
      result.push(line);
    } else if (inTable) {
      if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('```') || trimmed.startsWith('---')) {
        inTable = false;
        result.push(line);
      } else if (startsWithPipe && endsWithPipe) {
        // Complete, valid single-line table row
        result.push(line);
      } else if (startsWithPipe && !endsWithPipe) {
        // Table row started but split across multiple lines
        let accumulated = line;
        let j = i + 1;
        while (j < lines.length) {
          const nextTrimmed = lines[j].trim();
          if (nextTrimmed === '' || nextTrimmed.startsWith('#') || nextTrimmed.startsWith('```')) {
            break;
          }
          accumulated += ' <br /> ' + nextTrimmed;
          if (nextTrimmed.endsWith('|')) {
            i = j;
            break;
          }
          j++;
        }
        result.push(accumulated);
      } else if (!startsWithPipe && (endsWithPipe || trimmed.includes('|'))) {
        // Line missing leading pipe or trailing fragment
        if (result.length > 0 && result[result.length - 1].trim().endsWith('|')) {
          result.push('| ' + line);
        } else if (result.length > 0) {
          result[result.length - 1] += ' <br /> ' + line;
        } else {
          result.push(line);
        }
      } else {
        // Content line inside a table block without any pipes — append to preceding cell
        if (result.length > 0 && result[result.length - 1].includes('|')) {
          const prev = result[result.length - 1];
          const lastPipe = prev.lastIndexOf('|');
          if (lastPipe > 0) {
            result[result.length - 1] = prev.slice(0, lastPipe).trimEnd() + ' <br /> ' + trimmed + ' ' + prev.slice(lastPipe);
          } else {
            result[result.length - 1] += ' <br /> ' + trimmed;
          }
        } else {
          inTable = false;
          result.push(line);
        }
      }
    } else {
      if (startsWithPipe && endsWithPipe && trimmed.split('|').length >= 3) {
        // Table header row
        result.push(line);
      } else {
        result.push(line);
      }
    }
  }

  return result.join('\n');
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const sanitizedContent = normalizeMarkdown(content);

  return (
    <div className={`prose-ipsakti leading-relaxed text-slate-800 font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
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
            <div className="my-5 overflow-x-auto rounded-2xl border border-slate-300/80 shadow-md bg-white">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-950 border-b border-slate-200 font-display font-bold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/30">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-3 px-4 font-black text-slate-900 text-xs tracking-wider uppercase font-sans border-r border-slate-200 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-3 px-4 text-slate-700 text-xs leading-relaxed font-medium align-top border-r border-slate-100 last:border-r-0 [&_br]:mb-1.5">
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
