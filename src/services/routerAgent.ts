/**
 * IP-SAKTI Sahayak — Zero-Shot LLM Router Agent Service (Frontend)
 * Calls backend /api/v1/classify to classify natural language queries
 * dynamically into CONVERSATIONAL, STATUTORY_KNOWLEDGE, or FORMULATION_AUDIT
 * eliminating hardcoded keyword lexicons.
 */

export type IntentCategory = 'CONVERSATIONAL' | 'STATUTORY_KNOWLEDGE' | 'FORMULATION_AUDIT';

export interface ClassificationResult {
  intent: IntentCategory;
  reason: string;
}

export async function classifyQueryWithLLM(query: string): Promise<ClassificationResult> {
  const qClean = query.trim();
  if (!qClean) {
    return { intent: 'CONVERSATIONAL', reason: 'Empty query' };
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: qClean }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.intent && ['CONVERSATIONAL', 'STATUTORY_KNOWLEDGE', 'FORMULATION_AUDIT'].includes(data.intent)) {
        return {
          intent: data.intent as IntentCategory,
          reason: data.reason || 'LLM Router classification',
        };
      }
    }
  } catch (err) {
    console.warn('Backend LLM Router unreachable, using client heuristic fallback:', err);
  }

  // Graceful client fallback
  const qLower = qClean.toLowerCase();
  const formulationIndicators = [
    'extract', 'capsule', 'syrup', 'tablet', 'powder', 'churna', 'samhita',
    'fraction', 'tea', 'aahar', 'wellness', 'gummy', 'oil', 'taila',
    'ashwagandha', 'guduchi', 'curcumin', 'turmeric', 'tulsi', 'brahmi', 'neem',
    'triphala', 'shilajit', 'amla', 'bhasma', 'kashaya', 'kwath', 'avaleha',
    'formulation', 'composition', 'dose', 'mg', 'ratio', 'delivery'
  ];
  const hasFormulation = formulationIndicators.some(t => qLower.includes(t));
  const isMeta = ['ip sakti', 'ipsakti', 'ip-sakti', 'sakti', 'who are you', 'what is your name', 'my name', 'hello', 'hi', 'hey'].some(k => qLower.includes(k));

  if (isMeta || qLower.includes('name')) {
    return { intent: 'CONVERSATIONAL', reason: 'Heuristic meta fallback' };
  }
  if (!hasFormulation || qLower.startsWith('what') || qLower.startsWith('wha') || qLower.startsWith('wt') || qLower.startsWith('how') || qLower.startsWith('explain')) {
    return { intent: 'STATUTORY_KNOWLEDGE', reason: 'Heuristic Q&A fallback' };
  }

  return { intent: 'FORMULATION_AUDIT', reason: 'Heuristic formulation fallback' };
}
