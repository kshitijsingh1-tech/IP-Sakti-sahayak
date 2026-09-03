"""
IP-SAKTI — Multilingual Client (Bhashini + Free LLM Fallback)
--------------------------------------------------------------
Provides translation (EN ↔ HI ↔ SA ↔ TA ↔ TE ↔ KN ↔ ML ↔ BN ↔ GU ↔ MR)
and transliteration.

Translation Cascade:
  1. Primary: Government of India Bhashini ULCA API (if BHASHINI_API_KEY set)
  2. Free Fallback: Groq / Gemini LLM Translation via llm_layer (zero-config)
"""
from __future__ import annotations
import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

BHASHINI_INFERENCE_URL = os.getenv(
    "BHASHINI_INFERENCE_URL",
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
)

LANG_CODE = {
    "en": "en",
    "hi": "hi",
    "sa": "sa",      # Sanskrit
    "ta": "ta",      # Tamil
    "te": "te",      # Telugu
    "kn": "kn",      # Kannada
    "ml": "ml",      # Malayalam
    "bn": "bn",      # Bengali
    "gu": "gu",      # Gujarati
    "mr": "mr",      # Marathi
    "pa": "pa",      # Punjabi
    "ur": "ur",      # Urdu (Unani)
}

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "sa": "Sanskrit (संस्कृतम्)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "mr": "Marathi (मराठी)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "ur": "Urdu (اردو)",
}

SUPPORTED_LANGS = set(LANG_CODE.keys())


async def translate(text: str, source_lang: str = "en", target_lang: str = "hi") -> str:
    """
    Translates text between supported languages.
    Tries Bhashini API first; falls back to LLM translation if key missing or request fails.
    """
    if source_lang == target_lang or target_lang not in SUPPORTED_LANGS or not text.strip():
        return text

    api_key = os.getenv("BHASHINI_API_KEY")
    user_id = os.getenv("BHASHINI_USER_ID")

    # 1. Try Bhashini ULCA API if configured
    if api_key and user_id and "your_bhashini" not in api_key:
        try:
            return await _translate_bhashini(text, source_lang, target_lang, api_key, user_id)
        except Exception as e:
            logger.warning("Bhashini API failed (%s): falling back to LLM translation.", e)

    # 2. Free Fallback — LLM Translation via Groq / Gemini
    return await _translate_llm_fallback(text, source_lang, target_lang)


async def _translate_bhashini(text: str, source_lang: str, target_lang: str, api_key: str, user_id: str) -> str:
    payload = {
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": LANG_CODE.get(source_lang, source_lang),
                        "targetLanguage": LANG_CODE.get(target_lang, target_lang),
                    }
                }
            }
        ],
        "inputData": {"input": [{"source": text}]}
    }
    headers = {"userID": user_id, "ulcaApiKey": api_key, "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(BHASHINI_INFERENCE_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return (
            data.get("pipelineResponse", [{}])[0]
            .get("output", [{}])[0]
            .get("target", text)
        )


async def _translate_llm_fallback(text: str, source_lang: str, target_lang: str) -> str:
    """
    Free fallback translation using Groq/Gemini/Ollama LLM.
    """
    try:
        from services.llm_layer import get_llm_with_fallback, chat
        llm = get_llm_with_fallback()
        target_name = LANG_NAMES.get(target_lang, target_lang)
        prompt = (
            f"You are a professional legal & AYUSH translator. "
            f"Translate the following text accurately into {target_name}. "
            f"Preserve all statutory citations, Section numbers, and technical terms. "
            f"Output ONLY the translated text without extra explanation:\n\n{text}"
        )
        translated = await chat(llm, system="You are an expert AYUSH and legal translator.", user=prompt)
        return translated.strip() if translated else text
    except Exception as e:
        logger.error("LLM translation fallback failed: %s", e)
        return text


async def transliterate(text: str, source_lang: str = "en", target_lang: str = "hi") -> str:
    if source_lang == target_lang:
        return text
    api_key = os.getenv("BHASHINI_API_KEY")
    user_id = os.getenv("BHASHINI_USER_ID")
    if not api_key or not user_id or "your_bhashini" in api_key:
        return text

    payload = {
        "pipelineTasks": [
            {
                "taskType": "transliteration",
                "config": {
                    "language": {
                        "sourceLanguage": LANG_CODE.get(source_lang, source_lang),
                        "targetLanguage": LANG_CODE.get(target_lang, target_lang),
                    }
                }
            }
        ],
        "inputData": {"input": [{"source": text}]}
    }
    headers = {"userID": user_id, "ulcaApiKey": api_key, "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(BHASHINI_INFERENCE_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target", text)
    except Exception as e:
        logger.error("Bhashini transliteration failed: %s", e)
        return text


def is_supported_language(lang_code: str) -> bool:
    return lang_code in SUPPORTED_LANGS


def get_supported_languages() -> dict:
    return LANG_NAMES
