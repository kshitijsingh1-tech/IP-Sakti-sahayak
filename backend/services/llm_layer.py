"""
IP-SAKTI — LLM Layer
----------------------
Multi-provider LLM abstraction with automatic fallback chain:
  Primary:  Groq (LLaMA 4 / Mixtral — fast, free tier)
  Fallback: Google Gemini
  Local:    Ollama (offline / air-gapped environments)

Usage:
    from services.llm_layer import get_llm, chat, SYSTEM_PROMPT_AYUSH

    llm = get_llm()
    response = await chat(llm, system=SYSTEM_PROMPT_AYUSH, user="Can I patent Ashwagandha?")
"""
from __future__ import annotations
import os
import asyncio
import logging
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Reliably load backend/.env first, then root .env
_backend_env = Path(__file__).resolve().parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)
load_dotenv()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared AYUSH IPR System Prompt — injected into every agent call
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_AYUSH = """You are IP-SAKTI Sahayak, an authoritative AI assistant for Intellectual Property Rights (IPR) and biodiversity law specific to AYUSH (Ayurveda, Yoga, Unani, Siddha, Homeopathy) products.

CORE RULES:
1. ALWAYS cite the exact statute, rule number, treaty article, or pharmacopoeial entry you rely on.
2. ALWAYS include a confidence indicator (HIGH / MEDIUM / LOW) per answer.
3. ALWAYS state: "This is information, not legal advice. Consult a registered Patent Agent or AYUSH IP Facilitator for official filings."
4. NEVER fabricate statutory provisions, case citations, or registry records.
5. If uncertain or out-of-scope, ABSTAIN and say so explicitly.
6. Keep INDIA and INTERNATIONAL answers VISIBLY SEPARATE when jurisdiction is relevant.
7. Respond in the language specified by the user (default: English).

LEGAL CORPUS YOU OPERATE ON:
- Patents Act 1970 (Amended 2024) — Sections 3(p), 3(d), 3(j), disclosure requirements
- Biological Diversity Act 2002 (Amended 2023) + BD Rules 2024 — NBA Section 6 pre-approval
- Trade Marks Act 1999, Geographical Indications Act 1999, Designs Act 2000, Copyright Act 1957
- Protection of Plant Varieties and Farmers' Rights Act 2001
- Drugs and Cosmetics Act 1940 + Rules; Schedule T; First Schedule
- FSSAI Ayurveda Aahar Regulations 2022
- Drugs and Magic Remedies (Objectionable Advertisements) Act 1954
- Ayurvedic Pharmacopoeia of India (API), Siddha Pharmacopoeia, Unani Pharmacopoeia
- Traditional Knowledge Digital Library (TKDL) corpus
- WIPO GRATK Treaty 2024, TRIPS Agreement, Nagoya Protocol, CBD
- PCT, Madrid System, Hague System, Budapest Treaty
- EMA THMPD Guidelines, WHO Monographs on Selected Medicinal Plants
- Digital Personal Data Protection Act 2023 (DPDP) — for privacy guardrails
"""

# ---------------------------------------------------------------------------
# Provider Loader
# ---------------------------------------------------------------------------

def get_llm(provider: Optional[str] = None):
    """
    Returns an LLM client. Tries providers in order: groq → gemini → ollama.
    Raises RuntimeError if no provider is configured.
    """
    provider = provider or os.getenv("LLM_PROVIDER", "groq")

    if provider == "groq":
        return _load_groq()
    if provider == "gemini":
        return _load_gemini()
    if provider == "ollama":
        return _load_ollama()

    raise RuntimeError(f"Unknown LLM_PROVIDER '{provider}'. Set to: groq | gemini | ollama")


def get_llm_with_fallback():
    """Tries Groq first, falls back to Gemini, then Ollama."""
    for provider in ["groq", "gemini", "ollama"]:
        try:
            llm = get_llm(provider)
            logger.info("LLM loaded via provider: %s", provider)
            return llm
        except Exception as e:
            logger.warning("Provider '%s' failed: %s — trying next.", provider, e)
    raise RuntimeError("All LLM providers failed. Check API keys in .env")


# ---------------------------------------------------------------------------
# Provider Implementations
# ---------------------------------------------------------------------------

def _load_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in .env")

    model = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    # Always use DirectGroqLLM for resilient multi-model fallback and automatic 429 retry handling
    return DirectGroqLLM(api_key=api_key, model=model)


def get_direct_groq_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    model = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    return DirectGroqLLM(api_key=api_key, model=model)


class DirectGroqLLM:
    """Lightweight direct REST client for Groq API."""
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    async def ainvoke(self, messages):
        import httpx
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload_messages = []
        for msg in messages:
            role = "system" if getattr(msg, "type", "") == "system" or getattr(msg, "role", "") == "system" else "user"
            content = getattr(msg, "content", str(msg))
            payload_messages.append({"role": role, "content": content})

        models_to_try = [
            self.model,
            "groq/compound-mini",
            "qwen/qwen3.6-27b",
            "groq/compound",
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b"
        ]
        # Deduplicate while preserving order
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

        async with httpx.AsyncClient(timeout=35.0) as client:
            for model_candidate in models_to_try:
                for attempt in range(2):
                    try:
                        resp = await client.post(
                            url,
                            headers={
                                "Authorization": f"Bearer {self.api_key}",
                                "Content-Type": "application/json",
                                "User-Agent": "IP-SAKTI/1.0"
                            },
                            json={
                                "model": model_candidate,
                                "messages": payload_messages,
                                "max_tokens": 1500,
                                "temperature": 0.1
                            }
                        )
                        if resp.status_code == 429:
                            err_text = resp.text.lower()
                            # Daily limit (TPD / RPD) will not reset in a few seconds - skip immediately to next model
                            if "per day" in err_text or "tpd" in err_text or "rpd" in err_text:
                                logger.warning("Groq daily quota reached on %s. Switching immediately to next model candidate.", model_candidate)
                                break
                            
                            # Minute-based rate limit: check retry-after header (typically 100ms - 1s)
                            retry_hdr = resp.headers.get("retry-after")
                            wait_sec = 0.5
                            if retry_hdr:
                                try:
                                    wait_sec = min(float(retry_hdr), 2.0)
                                except (ValueError, TypeError):
                                    pass
                            logger.warning("Groq minute rate limit 429 on %s. Retrying in %.2fs...", model_candidate, wait_sec)
                            await asyncio.sleep(wait_sec)
                            continue

                        resp.raise_for_status()
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"]

                        class LLMResponse:
                            def __init__(self, text):
                                self.content = text
                        return LLMResponse(content)
                    except httpx.HTTPStatusError as err:
                        if err.response.status_code == 429:
                            err_text = err.response.text.lower()
                            if "per day" in err_text or "tpd" in err_text or "rpd" in err_text:
                                logger.warning("Groq daily quota reached on %s. Skipping model.", model_candidate)
                                break
                            await asyncio.sleep(0.5)
                            continue
                        logger.error("Groq HTTP error %s on %s: %s", err.response.status_code, model_candidate, err.response.text[:200])
                        break
                    except Exception as exc:
                        logger.warning("Groq request error on %s: %s", model_candidate, exc)
                        await asyncio.sleep(0.5)
                        break

        raise RuntimeError("All Groq models and attempts exhausted due to rate limits or connectivity.")


def _load_gemini():
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError:
        raise ImportError("Run: pip install langchain-google-genai")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in .env")

    return ChatGoogleGenerativeAI(
        google_api_key=api_key,
        model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
        temperature=float(os.getenv("AGENT_TEMPERATURE", "0.1")),
    )


def _load_ollama():
    try:
        from langchain_community.chat_models import ChatOllama
    except ImportError:
        raise ImportError("Run: pip install langchain-community")

    return ChatOllama(
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
        temperature=float(os.getenv("AGENT_TEMPERATURE", "0.1")),
    )


# ---------------------------------------------------------------------------
# Unified Chat Helper
# ---------------------------------------------------------------------------

async def chat(llm, system: str, user: str, context: str = "") -> str:
    """
    Sends a system + optional context + user message to the LLM.
    Returns the text response. Works with both LangChain and Direct REST LLM objects.
    """
    try:
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [SystemMessage(content=system)]
            if context:
                messages.append(HumanMessage(content=f"[Context]\n{context}"))
            messages.append(HumanMessage(content=user))
        except ImportError:
            class SimpleMsg:
                def __init__(self, role, content):
                    self.role = role
                    self.content = content
                    self.type = role

            messages = [SimpleMsg("system", system)]
            if context:
                messages.append(SimpleMsg("user", f"[Context]\n{context}"))
            messages.append(SimpleMsg("user", user))

        response = await llm.ainvoke(messages)
        return response.content
    except Exception as e:
        logger.error("LLM chat failed: %s", e)
        return ""


# ---------------------------------------------------------------------------
# Guardrail: Out-of-scope detection
# ---------------------------------------------------------------------------

OUT_OF_SCOPE_SIGNALS = [
    "cricket", "stock market", "recipe", "relationship", "weather",
    "movie", "politics", "election", "sports", "celebrity",
]

def is_out_of_scope(query: str) -> bool:
    """Returns True if query is clearly unrelated to AYUSH IPR."""
    q = query.lower()
    return any(sig in q for sig in OUT_OF_SCOPE_SIGNALS) and not any(
        kw in q for kw in ["patent", "ayush", "herb", "formulation", "trademark", "ip", "biodiversity"]
    )

ABSTAIN_RESPONSE = (
    "This query appears to be outside the scope of AYUSH Intellectual Property Rights and biodiversity law. "
    "IP-SAKTI Sahayak is designed specifically to answer questions about patents, trademarks, GI, ABS duties, "
    "TKDL prior-art, and regulatory classification for Ayurvedic, Siddha, Unani, Yoga, and Homeopathy products. "
    "Please rephrase your query within this domain."
)
