/**
 * IP-SAKTI Sahayak — Unified Smart Router Agent (Frontend v2)
 * Single source of truth for query intent classification.
 * Calls backend /api/v1/classify and maps to 4 auto-detected modes.
 * The user NEVER selects a mode — the system decides automatically.
 */

export type RouteMode = 'CHAT' | 'GUIDE' | 'HYBRID' | 'AUDIT';

export interface SmartClassification {
  mode: RouteMode;
  confidence: number;
  reason: string;
  entities: {
    ingredients?: string[];
    legal_refs?: string[];
    composition_params?: string[];
  };
}

/**
 * Calls backend LLM router for deterministic intent classification.
 * Falls back to client heuristic only when backend is unreachable.
 */
export async function classifyQuerySmart(query: string): Promise<SmartClassification> {
  const qClean = query.trim();
  if (!qClean) {
    return { mode: 'CHAT', confidence: 1.0, reason: 'Empty query', entities: {} };
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
      const mode = data.mode as RouteMode;
      if (mode && ['CHAT', 'GUIDE', 'HYBRID', 'AUDIT'].includes(mode)) {
        return {
          mode,
          confidence: data.confidence ?? 0.5,
          reason: data.reason ?? 'LLM Router',
          entities: data.entities ?? {},
        };
      }
      // Legacy 3-category mapping (if backend returns old format)
      if (data.intent) {
        const legacyMap: Record<string, RouteMode> = {
          CONVERSATIONAL: 'CHAT',
          STATUTORY_KNOWLEDGE: 'GUIDE',
          FORMULATION_AUDIT: 'AUDIT',
        };
        return {
          mode: legacyMap[data.intent] ?? 'HYBRID',
          confidence: data.confidence ?? 0.5,
          reason: data.reason ?? 'Legacy mapping',
          entities: data.entities ?? {},
        };
      }
    }
  } catch (err) {
    console.warn('Backend Smart Router unreachable, using client heuristic:', err);
  }

  // --- Client heuristic fallback ---
  return clientHeuristicFallback(qClean);
}

function clientHeuristicFallback(query: string): SmartClassification {
  const q = query.toLowerCase().trim();

  // Herb names & dosage forms
  const herbs = ['ashwagandha', 'guduchi', 'curcumin', 'tulsi', 'brahmi', 'neem',
    'triphala', 'shilajit', 'amla', 'haridra', 'shatavari', 'giloy'];
  const forms = ['capsule', 'tablet', 'syrup', 'powder', 'churna', 'extract',
    'fraction', 'mg', 'ml', 'gummy', 'oil', 'taila'];
  const hasHerb = herbs.some(h => q.includes(h));
  const hasForm = forms.some(f => q.includes(f));

  // Statutory / Legal signals
  const statutoryTerms = ['patent', 'act', 'section', 'law', 'rule', 'fee', 'cost', 'file', 'filing',
    'tkdl', 'nba', 'abs', 'biodiversity', 'treaty', 'pct', 'wipo', 'fssai',
    'ayush', 'license', 'trademark', 'copyright', 'prior art', 'infringement',
    'examination', 'grant', 'novelty', 'cdsco', 'ipr'];
  const hasStatutory = statutoryTerms.some(t => q.includes(t));

  // 1. Formulation + Patentability / Feasibility Question -> HYBRID
  if ((hasHerb || hasForm) && (hasStatutory || q.endsWith('?') || q.includes('can i') || q.includes('patent'))) {
    return { mode: 'HYBRID', confidence: 0.85, reason: 'Heuristic: formulation + feasibility question', entities: {} };
  }

  // 2. Concrete Formulation Audit -> AUDIT
  if (hasHerb && hasForm && !q.endsWith('?')) {
    return { mode: 'AUDIT', confidence: 0.8, reason: 'Heuristic: herb + dosage form', entities: {} };
  }

  // 3. Statutory Knowledge Question -> GUIDE
  const pureQuestion = ['what is', 'what are', 'how to', 'how do', 'explain',
    'define', 'tell me about', 'wha ', 'wt '].some(s => q.startsWith(s));
  if (hasStatutory && (pureQuestion || !hasHerb)) {
    return { mode: 'GUIDE', confidence: 0.8, reason: 'Heuristic: knowledge Q&A', entities: {} };
  }

  // 4. Strict Word-Bounded Greeting / Meta Signals (only if short and no herbs/statutes)
  const isShort = q.split(/\s+/).length <= 7;
  const isMeta = /\b(who are you|what is your name|my name|who made you|what do you do)\b/.test(q);
  const isGreetingWord = /\b(hello|hi|hey|thanks|thank you|bye|namaste)\b/.test(q);
  if ((isMeta || isGreetingWord) && isShort && !hasHerb && !hasStatutory) {
    return { mode: 'CHAT', confidence: 0.9, reason: 'Heuristic: greeting/meta', entities: {} };
  }

  // 5. General knowledge without statutory terms -> CHAT
  if (!hasHerb && !hasStatutory) {
    return { mode: 'CHAT', confidence: 0.85, reason: 'Heuristic: general/miscellaneous query', entities: {} };
  }

  // 6. Default Safe -> HYBRID
  return { mode: 'HYBRID', confidence: 0.7, reason: 'Heuristic: ambiguous, defaulting safe', entities: {} };
}

// Legacy compatibility export
export async function classifyQueryWithLLM(query: string) {
  const result = await classifyQuerySmart(query);
  const modeMap: Record<RouteMode, string> = {
    CHAT: 'CONVERSATIONAL',
    GUIDE: 'STATUTORY_KNOWLEDGE',
    HYBRID: 'STATUTORY_KNOWLEDGE',
    AUDIT: 'FORMULATION_AUDIT',
  };
  return {
    intent: modeMap[result.mode] as 'CONVERSATIONAL' | 'STATUTORY_KNOWLEDGE' | 'FORMULATION_AUDIT',
    reason: result.reason,
    mode: result.mode,
    confidence: result.confidence,
    entities: result.entities,
  };
}
