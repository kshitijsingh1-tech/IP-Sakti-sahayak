"""
IP-SAKTI Sahayak — Unified Smart Router Agent (v2)
--------------------------------------------------------------
Single source of truth for query intent classification.
Uses a deterministic (temperature=0) LLM call with entity extraction
to auto-detect the correct response mode for ANY natural language input.

Modes (invisible to user — system decides automatically):
  CHAT   — Greetings, identity, meta ("hi", "who are you")
  GUIDE  — Knowledge Q&A ("what is patent", "explain section 3d")
  HYBRID — Ambiguous composition + question ("is 2% alcohol patentable?")
  AUDIT  — Full formulation audit ("Ashwagandha 500mg capsule with Guduchi extract")
"""
from __future__ import annotations
import os
import re
import json
import asyncio
import importlib
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Deterministic Router System Prompt
# ---------------------------------------------------------------------------

ROUTER_SYSTEM_PROMPT = """You are the Unified Smart Router for IP-SAKTI Sahayak, an AYUSH IPR & Biodiversity governance platform.

Your job: Analyze the user's query and classify it into exactly ONE of 4 modes. Return ONLY valid JSON.

## MODES

### CHAT
- Greetings, identity questions, meta platform queries, and ALL general miscellaneous queries.
- Includes: everyday questions, recipes/cooking, math, science, history, coding, philosophy, jokes, casual conversation, out-of-domain questions.
- Examples: "hi", "hello", "who are you", "what is ip sakti", "recipe for pasta", "how do stars form", "what is 25 * 4", "tell me a joke", "write a python function"

### GUIDE
- Asking about patent law, statutory definitions, filing procedures, fees, legal sections, treaties (Patents Act 1970/2024, BD Act 2023, TKDL, WIPO, PCT, Trademark, Copyright, CDSCO, FSSAI).
- The user wants INFORMATION, EXPLANATION, or LEGAL EDUCATION, not an audit of a specific formulation.
- Examples: "what is a patent", "explain section 3(d)", "how to file a patent in India", "what is TKDL", "is patenting free in India", "how does PCT filing work"

### HYBRID
- The user mentions an abstract product idea or general composition AND asks about patentability or legal feasibility.
- They are NOT submitting a full quantitative formulation for audit — they want strategic feasibility guidance.
- Examples: "if I make a turmeric neem face cream can I patent it?", "is 2% alcohol patentable?", "can herbal tea be patented?"
- Key signal: question about patentability / eligibility of an idea or partial formulation.

### AUDIT
- The user is submitting a concrete botanical formulation, product composition, or extract with named ingredients for a statutory audit.
- Contains specific herbs/ingredients + dosage forms/ratios OR detailed product claims.
- Examples: "Ashwagandha 500mg + Guduchi 250mg extract capsule for stress", "Curcumin 98% bioactive fraction formulation", "Herbal tea with 40% Tulsi, 30% Ginger, 30% Cinnamon"
- Key signal: concrete named herbs/botanicals + dosage/form/percentage to run an audit.

## DECISION RULES
1. If the query is off-topic, casual, recipe, math, science, general trivia, or platform greeting WITHOUT any patent or herbal formulation questions → CHAT
2. If the query asks for pure statutory definitions, legal procedures, fees, or IP law education → GUIDE
3. If the query asks whether an Ayurvedic/herbal product or concept can be patented, exported, or commercialized (e.g., "Can I patent X in India and sell it in Germany?"), or asks about patentability feasibility → ALWAYS classify as HYBRID (NEVER CHAT).
4. If the query provides concrete botanical ingredients with dosages/forms to run a full statutory clearance audit → AUDIT

## OUTPUT FORMAT
Return ONLY this JSON (no markdown, no code fences, no extra text):
{"mode": "CHAT|GUIDE|HYBRID|AUDIT", "confidence": 0.0-1.0, "reason": "brief explanation", "entities": {"ingredients": [], "legal_refs": [], "composition_params": []}}
"""


async def classify_intent(query: str, conversation_context: str = "") -> Dict[str, Any]:
    """
    Unified intent classification using deterministic LLM call.
    Returns: {"mode": "CHAT|GUIDE|HYBRID|AUDIT", "confidence": float, "reason": str, "entities": dict}
    """
    q_clean = query.strip()
    if not q_clean:
        return {"mode": "CHAT", "confidence": 1.0, "reason": "Empty query", "entities": {}}

    # --- Attempt LLM classification with temperature=0 ---
    try:
        llm = _get_router_llm()
        if llm:
            user_msg = f'Classify this query:\n"{q_clean}"'
            if conversation_context:
                user_msg = f'Recent conversation context:\n{conversation_context}\n\nNew query to classify:\n"{q_clean}"'

            response_text = await _chat_deterministic(llm, ROUTER_SYSTEM_PROMPT, user_msg)

            # Clean response: strip closed <think>...</think> and unclosed <think>...
            cleaned = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL)
            cleaned = re.sub(r'<think>.*$', '', cleaned, flags=re.DOTALL).strip()
            cleaned = re.sub(r'```json\s*', '', cleaned)
            cleaned = re.sub(r'```\s*', '', cleaned).strip()

            # Robust JSON extraction
            json_match = re.search(r'\{.*\}', cleaned, flags=re.DOTALL)
            json_str = json_match.group(0) if json_match else cleaned
            parsed = json.loads(json_str)
            mode = parsed.get("mode", "CHAT")
            confidence = float(parsed.get("confidence", 0.9))

            if mode in ["CHAT", "GUIDE", "HYBRID", "AUDIT"]:
                logger.info("Smart Router: '%s' → [%s] (confidence=%.2f)", q_clean[:50], mode, confidence)
                return {
                    "mode": mode,
                    "confidence": confidence,
                    "reason": parsed.get("reason", "LLM classified"),
                    "entities": parsed.get("entities", {})
                }
    except json.JSONDecodeError as e:
        logger.warning("Router JSON parse failed: %s", e)
    except Exception as e:
        logger.warning("Smart Router LLM call failed (%s) — using heuristic fallback", e)

    # --- Heuristic fallback (only when LLM is unreachable) ---
    return _heuristic_fallback(q_clean)


def _get_router_llm():
    """Get an LLM client specifically for routing (uses same provider chain)."""
    try:
        from backend.services.llm_layer import get_llm_with_fallback
    except ImportError:
        from services.llm_layer import get_llm_with_fallback
    return get_llm_with_fallback()


async def _chat_deterministic(llm, system: str, user: str) -> str:
    """Chat with temperature=0 for deterministic classification."""
    try:
        try:
            core_msg_mod = importlib.import_module("langchain_core.messages")
            SystemMessage = getattr(core_msg_mod, "SystemMessage")
            HumanMessage = getattr(core_msg_mod, "HumanMessage")
            messages = [SystemMessage(content=system), HumanMessage(content=user)]
        except (ImportError, AttributeError):
            class SimpleMsg:
                def __init__(self, role, content):
                    self.role = role
                    self.content = content
                    self.type = role
            messages = [SimpleMsg("system", system), SimpleMsg("user", user)]

        # If it's our DirectGroqLLM, use it directly (already handles temp)
        # For LangChain models, try to override temperature
        if hasattr(llm, 'temperature'):
            original_temp = llm.temperature
            llm.temperature = 0.0
            try:
                response = await llm.ainvoke(messages)
            finally:
                llm.temperature = original_temp
        else:
            response = await llm.ainvoke(messages)

        return response.content
    except Exception as e:
        logger.error("Deterministic chat failed: %s", e)
        return ""


def _heuristic_fallback(query: str) -> Dict[str, Any]:
    """Last-resort pattern matching when LLM is completely unreachable."""
    q = query.lower().strip()

    # Herb names & dosage forms
    herb_names = ["ashwagandha", "guduchi", "curcumin", "tulsi", "brahmi", "neem",
                  "triphala", "shilajit", "amla", "haridra", "shatavari", "giloy"]
    dosage_forms = ["capsule", "tablet", "syrup", "powder", "churna", "extract",
                    "fraction", "mg", "ml", "gummy", "oil", "taila"]
    has_herb = any(h in q for h in herb_names)
    has_form = any(f in q for f in dosage_forms)

    # Statutory / Legal signals
    statutory_terms = ["patent", "act", "section", "law", "rule", "fee", "cost", "file", "filing",
                       "tkdl", "nba", "abs", "biodiversity", "treaty", "pct", "wipo", "fssai",
                       "ayush", "license", "trademark", "copyright", "prior art", "infringement",
                       "examination", "grant", "novelty", "cdsco", "ipr"]
    has_statutory = any(t in q for t in statutory_terms)

    # 1. Formulation + Patentability / Feasibility Question -> HYBRID
    if (has_herb or has_form) and (has_statutory or q.endswith("?") or "can i" in q or "patent" in q):
        return {"mode": "HYBRID", "confidence": 0.85, "reason": "Heuristic: herb formulation + feasibility question", "entities": {}}

    # 2. Pure Concrete Formulation Audit -> AUDIT
    if has_herb and has_form and not q.endswith("?"):
        return {"mode": "AUDIT", "confidence": 0.8, "reason": "Heuristic: herb + dosage form", "entities": {}}

    # 3. Statutory / Legal Concept Question -> GUIDE
    pure_question = q.startswith(("what is", "what are", "how to", "how do", "explain",
                                   "define", "tell me about", "wha ", "wt "))
    if has_statutory and (pure_question or not has_herb):
        return {"mode": "GUIDE", "confidence": 0.8, "reason": "Heuristic: knowledge question", "entities": {}}

    # 4. Strictly Word-Bounded Greeting / Meta Signals (only if short and no herbs/statutes)
    is_short = len(q.split()) <= 7
    is_meta = bool(re.search(r'\b(who are you|what is your name|my name|who made you|what do you do)\b', q))
    is_greeting_word = bool(re.search(r'\b(hello|hi|hey|thanks|thank you|bye|namaste)\b', q))
    if (is_meta or is_greeting_word) and is_short and not has_herb and not has_statutory:
        return {"mode": "CHAT", "confidence": 0.9, "reason": "Heuristic: greeting/meta", "entities": {}}

    # 5. Out-of-domain / General knowledge questions without statutory terms -> CHAT
    if not has_herb and not has_statutory:
        return {"mode": "CHAT", "confidence": 0.85, "reason": "Heuristic: general/miscellaneous query", "entities": {}}

    # 6. Default Safe -> HYBRID
    return {"mode": "HYBRID", "confidence": 0.7, "reason": "Heuristic: ambiguous, defaulting safe", "entities": {}}


# Legacy compatibility wrapper
async def classify_query_intent_llm(query: str) -> Dict[str, Any]:
    """Legacy wrapper — maps new 4-mode system to old 3-category interface."""
    result = await classify_intent(query)
    mode = result["mode"]
    mode_map = {
        "CHAT": "CONVERSATIONAL",
        "GUIDE": "STATUTORY_KNOWLEDGE",
        "HYBRID": "STATUTORY_KNOWLEDGE",
        "AUDIT": "FORMULATION_AUDIT"
    }
    return {
        "intent": mode_map.get(mode, "FORMULATION_AUDIT"),
        "reason": result.get("reason", ""),
        "mode": mode,
        "confidence": result.get("confidence", 0.5),
        "entities": result.get("entities", {})
    }
