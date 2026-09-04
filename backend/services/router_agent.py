"""
IP-SAKTI Sahayak — Zero-Shot LLM Intent Router Agent
--------------------------------------------------------------
Classifies any natural language query dynamically using LLM zero-shot reasoning.
Eliminates rigid hardcoded keyword lexicons and regular expressions.
Handles typos, Hinglish ("patnt kaise file kare"), meta questions ("wha is ip sakti"),
and distinguishes them cleanly from botanical formulation audits.
"""
from __future__ import annotations
import json
import logging
from typing import Dict, Any
from backend.services.llm_layer import get_llm_with_fallback, chat

logger = logging.getLogger(__name__)

CLASSIFIER_SYSTEM_PROMPT = """You are the Zero-Shot Intent Router Agent for the IP-SAKTI Sahayak AYUSH IPR & Biodiversity Governance Platform.
Your sole job is to classify the user's natural language query into EXACTLY ONE of these 3 intent categories:

1. CONVERSATIONAL:
   - Greetings, chitchat, identity questions, typos ("hi", "hello", "wha is ip sakti", "who are you", "my name is Rahul", "who created this").
   - Meta queries asking what IP-SAKTI is, how it works, or platform overview.

2. STATUTORY_KNOWLEDGE:
   - General informational Q&A about patent law definitions, Patents Act 1970, Section 3(p) TK bar, Section 3(d) efficacy rules, NBA pre-approval process, TKDL database guidance, filing fees.
   - Questions asking "what is patent", "how to patent", "explain section 3d", "is patenting free in India", "patnt kaise file kare", "what is traditional knowledge".

3. FORMULATION_AUDIT:
   - Explicit botanical extract formulations, Ayurvedic polyherbal recipes, bioactive fractions, or specific product patent eligibility claims.
   - Examples: "Ashwagandha + Guduchi extract capsule 500mg", "Curcumin 98% fraction anti-inflammatory", "Classical Chyawanprash modification with liposomal delivery", "Herbal tea with tulsi and ginger for stress".

Output ONLY a JSON object with this exact structure:
{"intent": "CONVERSATIONAL" | "STATUTORY_KNOWLEDGE" | "FORMULATION_AUDIT", "reason": "<brief reasoning>"}
Do NOT output markdown syntax, code fences, or any other text.
"""

async def classify_query_intent_llm(query: str) -> Dict[str, Any]:
    """Classifies query using LLM zero-shot reasoning."""
    q_clean = query.strip()
    if not q_clean:
        return {"intent": "CONVERSATIONAL", "reason": "Empty query"}

    try:
        llm = get_llm_with_fallback()
        if llm:
            user_msg = f'User Query to classify: "{q_clean}"'
            response_text = await chat(llm, system=CLASSIFIER_SYSTEM_PROMPT, user=user_msg)
            
            # Clean thinking tags if present
            import re
            cleaned_resp = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
            # Strip code block markers if present
            cleaned_resp = re.sub(r'```json\s*', '', cleaned_resp)
            cleaned_resp = re.sub(r'```\s*', '', cleaned_resp).strip()

            parsed = json.loads(cleaned_resp)
            intent = parsed.get("intent", "FORMULATION_AUDIT")
            if intent in ["CONVERSATIONAL", "STATUTORY_KNOWLEDGE", "FORMULATION_AUDIT"]:
                logger.info("Zero-Shot LLM Router classified query '%s' as [%s]", q_clean, intent)
                return {"intent": intent, "reason": parsed.get("reason", "LLM classified")}
    except Exception as e:
        logger.warning("Zero-Shot LLM Intent Router failed (%s) — falling back to heuristic evaluation", e)

    # Fallback heuristic if LLM is unreachable
    q_lower = q_clean.lower()
    formulation_indicators = [
        "extract", "capsule", "syrup", "tablet", "powder", "churna", "samhita",
        "fraction", "tea", "aahar", "wellness", "gummy", "oil", "taila",
        "ashwagandha", "guduchi", "curcumin", "turmeric", "tulsi", "brahmi", "neem",
        "triphala", "shilajit", "amla", "bhasma", "kashaya", "kwath", "avaleha",
        "formulation", "composition", "dose", "mg", "ratio", "delivery"
    ]
    has_formulation = any(term in q_lower for term in formulation_indicators)
    meta_keywords = ["ip sakti", "ipsakti", "ip-sakti", "sakti", "who are you", "what is your name", "my name", "hello", "hi", "hey"]
    is_meta = any(k in q_lower for k in meta_keywords)

    if is_meta or "name" in q_lower:
        return {"intent": "CONVERSATIONAL", "reason": "Heuristic meta fallback"}
    if not has_formulation or q_lower.startswith(("what", "wha", "wt", "how", "explain", "define")):
        return {"intent": "STATUTORY_KNOWLEDGE", "reason": "Heuristic Q&A fallback"}

    return {"intent": "FORMULATION_AUDIT", "reason": "Heuristic formulation fallback"}
