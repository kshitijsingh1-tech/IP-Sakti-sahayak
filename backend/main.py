"""
IP-SAKTI Sahayak — Autonomous AYUSH RAG Backend
FastAPI + LangChain + pgvector + Groq LLM
"""
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

_backend_dir = str(Path(__file__).resolve().parent)
_root_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

load_dotenv()

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description="Autonomous AYUSH IP & Biodiversity Audit Engine — Multi-Agent RAG Pipeline",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ---------------------------------------------------------------------------
# CORS — allow Vite dev server and production domain
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class AuditRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Formulation or statutory query")
    jurisdiction: str = Field(default="INDIA", description="INDIA or INTERNATIONAL")
    law_year: str = Field(default="2024", description="Law version year e.g. 2024")
    language: str = Field(default="en", description="Response language: en | hi | sa | ta")

class AgentStepResponse(BaseModel):
    agent: str
    title: str
    status: str
    details: str
    timestamp: str
    findings: List[str] = []

class CitationResponse(BaseModel):
    id: str
    statute_or_source: str
    provision: str
    year_or_version: str
    authority_level: str
    excerpt: str
    confidence_score: int
    jurisdiction: str
    url: Optional[str] = None

class ClassificationResponse(BaseModel):
    category: str
    title: str
    confidence: int
    description: str
    regulatory_body: str
    evidence_requirements: List[str]
    ip_posture: str
    abs_posture: str

class ReadinessPassportResponse(BaseModel):
    overall_score: int
    patentability_score: int
    tk_clearance_score: int
    abs_compliance_score: int
    regulatory_readiness_score: int
    export_readiness_score: int
    critical_blockers: List[str]
    recommended_roadmap: List[str]

class AuditResponse(BaseModel):
    query_id: str
    user_query: str
    jurisdiction: str
    classification: ClassificationResponse
    agent_steps: List[AgentStepResponse]
    citations: List[CitationResponse]
    readiness_passport: ReadinessPassportResponse
    legal_disclaimer: str
    processing_time_ms: int


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "service": "IP-SAKTI Sahayak API",
        "version": "1.0.0",
        "rag_provider": os.getenv("RAG_PROVIDER", "chroma"),
        "llm_provider": os.getenv("LLM_PROVIDER", "groq"),
    }


# ---------------------------------------------------------------------------
# Document Upload Endpoint
# ---------------------------------------------------------------------------

class UploadedDocumentInfo(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    extracted_chars: int
    context_block: str   # The text block injected into the RAG pipeline

class UploadResponse(BaseModel):
    uploaded: List[UploadedDocumentInfo]
    combined_context: str   # All docs merged for a single RAG injection
    processing_time_ms: int


@app.post("/api/v1/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_documents(
    files: List[UploadFile] = File(..., description="PDF, PPT, PPTX, DOCX, CSV, TXT, JPG, PNG")
):
    """
    Accepts one or more documents (PDF, PPT/PPTX, DOC/DOCX, CSV, TXT, images).
    Extracts text from each and returns structured context blocks
    that can be appended to an audit query for the 4-Agent RAG pipeline.

    Supported formats: .pdf .ppt .pptx .doc .docx .txt .csv .jpg .jpeg .png .webp .gif
    Max file size: 25 MB per file (configurable via MAX_UPLOAD_SIZE_MB in .env)
    """
    try:
        from backend.services.document_processor import extract_text, build_document_context, SUPPORTED_EXTENSIONS
    except ImportError:
        from services.document_processor import extract_text, build_document_context, SUPPORTED_EXTENSIONS

    from pathlib import Path

    max_mb = int(os.getenv("MAX_UPLOAD_SIZE_MB", 25))
    start = time.time()
    results: List[UploadedDocumentInfo] = []
    combined_parts: List[str] = []

    for upload in files:
        filename = upload.filename or "unknown"
        ext = Path(filename).suffix.lower()

        # Validate extension
        if ext not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{ext}' for '{filename}'. "
                       f"Allowed: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
            )

        content = await upload.read()

        # Validate size
        size_bytes = len(content)
        if size_bytes > max_mb * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"File '{filename}' ({size_bytes // (1024*1024)} MB) exceeds {max_mb} MB limit."
            )

        # Extract text
        try:
            text = extract_text(filename, content)
        except ValueError as ve:
            raise HTTPException(status_code=415, detail=str(ve))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Extraction failed for '{filename}': {exc}")

        context_block = build_document_context(filename, text)
        combined_parts.append(context_block)

        results.append(UploadedDocumentInfo(
            filename=filename,
            content_type=upload.content_type or "application/octet-stream",
            size_bytes=size_bytes,
            extracted_chars=len(text),
            context_block=context_block,
        ))

    elapsed_ms = int((time.time() - start) * 1000)
    return UploadResponse(
        uploaded=results,
        combined_context="\n\n".join(combined_parts),
        processing_time_ms=elapsed_ms,
    )


# ---------------------------------------------------------------------------
# Zero-Shot Intent Router Endpoint
# ---------------------------------------------------------------------------

class ClassifyRequest(BaseModel):
    query: str

class ClassifyResponse(BaseModel):
    mode: str
    confidence: float
    reason: str
    entities: dict = {}
    # Legacy compat
    intent: str = ""

@app.post("/api/v1/classify", response_model=ClassifyResponse, tags=["Classification"])
async def classify_query(request: ClassifyRequest):
    """
    Unified Smart Router Agent endpoint:
    Auto-classifies any natural language query into:
      - CHAT (greetings, meta)
      - GUIDE (knowledge Q&A)
      - HYBRID (ambiguous composition + question)
      - AUDIT (full formulation audit)
    """
    try:
        try:
            from backend.services.router_agent import classify_intent
        except ImportError:
            from services.router_agent import classify_intent

        result = await classify_intent(request.query)
        mode = result.get("mode", "HYBRID")
        mode_to_intent = {"CHAT": "CONVERSATIONAL", "GUIDE": "STATUTORY_KNOWLEDGE", "HYBRID": "STATUTORY_KNOWLEDGE", "AUDIT": "FORMULATION_AUDIT"}
        return {
            "mode": mode,
            "confidence": result.get("confidence", 0.5),
            "reason": result.get("reason", ""),
            "entities": result.get("entities", {}),
            "intent": mode_to_intent.get(mode, "FORMULATION_AUDIT")
        }
    except Exception as e:
        return {"mode": "HYBRID", "confidence": 0.3, "reason": f"Fallback error: {str(e)}", "entities": {}, "intent": "STATUTORY_KNOWLEDGE"}


# ---------------------------------------------------------------------------
# Audio Transcription Endpoint — Groq Whisper-large-v3-turbo
# ---------------------------------------------------------------------------

@app.post("/api/v1/audio/transcribe", tags=["Audio"])
async def transcribe_audio(file: UploadFile = File(...), language: Optional[str] = "en"):
    """
    Transcribes audio recording using Groq Whisper-large-v3-turbo.
    Accepts webm, wav, mp3, ogg, mp4 audio blobs from frontend.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured on server")

    contents = await file.read()
    if not contents or len(contents) < 50:
        return {"text": ""}

    import httpx
    whisper_url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {api_key}"}

    filename = file.filename or "recording.webm"
    files = {"file": (filename, contents, file.content_type or "audio/webm")}
    data = {
        "model": "whisper-large-v3-turbo",
        "response_format": "json"
    }
    if language and language.startswith("hi"):
        data["language"] = "hi"
    elif language:
        data["language"] = "en"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(whisper_url, headers=headers, files=files, data=data)
            if resp.status_code != 200:
                print(f"[Whisper Error] {resp.status_code}: {resp.text}")
                raise HTTPException(status_code=resp.status_code, detail=f"Whisper transcription failed: {resp.text}")
            
            result = resp.json()
            return {"text": result.get("text", "").strip()}
    except httpx.RequestError as exc:
        print(f"[Whisper Network Error] {exc}")
        raise HTTPException(status_code=503, detail=f"Groq Whisper connection failed: {str(exc)}")


# ---------------------------------------------------------------------------
# Core Audit Endpoint — 4-Agent Pipeline
# ---------------------------------------------------------------------------

@app.post("/api/v1/audit", response_model=AuditResponse, tags=["Audit"])
async def run_audit(request: AuditRequest):
    """
    Triggers the 4-Agent Autonomous RAG Audit Pipeline:
    1. RESEARCHER  — Multi-source evidence retrieval from statutory vector DB + TKDL
    2. AUDITOR     — Date-versioned statutory compliance verification
    3. DEVILS_ADVOCATE — Patent examiner objection stress-testing
    4. STRATEGIST  — IP & ABS actionable roadmap synthesis
    """
    start = time.time()

    try:
        try:
            from backend.services.rag_pipeline import run_4_agent_pipeline
        except ImportError:
            from services.rag_pipeline import run_4_agent_pipeline

        result = await run_4_agent_pipeline(
            query=request.query,
            jurisdiction=request.jurisdiction,
            law_year=request.law_year,
            language=request.language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    elapsed_ms = int((time.time() - start) * 1000)
    result["processing_time_ms"] = elapsed_ms

    # Automatically save audit session to SQLite history DB
    try:
        try:
            from backend.services.history_db import save_audit_session
        except ImportError:
            from services.history_db import save_audit_session
        save_audit_session(result)
    except Exception as exc:
        pass

    return result


# ---------------------------------------------------------------------------
# Audit Session History Endpoints (SQLite Persistent DB)
# ---------------------------------------------------------------------------

@app.get("/api/v1/history", tags=["History"])
async def get_history(limit: int = 50):
    """Retrieves all past audit sessions from the persistent SQLite database."""
    try:
        from backend.services.history_db import get_all_audit_sessions
    except ImportError:
        from services.history_db import get_all_audit_sessions

    return {
        "status": "ok",
        "sessions": get_all_audit_sessions(limit=limit)
    }


@app.delete("/api/v1/history", tags=["History"])
async def delete_history():
    """Clears all audit session history from SQLite database."""
    try:
        from backend.services.history_db import clear_audit_history
    except ImportError:
        from services.history_db import clear_audit_history

    success = clear_audit_history()
    return {"status": "ok", "cleared": success}


@app.delete("/api/v1/history/{query_id}", tags=["History"])
async def delete_single_history(query_id: str):
    """Deletes a single audit session from SQLite database."""
    try:
        from backend.services.history_db import delete_audit_session
    except ImportError:
        from services.history_db import delete_audit_session

    success = delete_audit_session(query_id)
    return {"status": "ok", "deleted": success, "query_id": query_id}


# ---------------------------------------------------------------------------
# TKDL Corpus Search Endpoint
# ---------------------------------------------------------------------------

@app.get("/api/v1/tkdl/search", tags=["TKDL"])
async def search_tkdl(q: str, top_k: int = 5):
    """
    Vector similarity search over TKDL Sanskrit / Tamil classical corpora.
    Returns top-k matching classical formulation records.
    """
    # TODO: Wire to pgvector / ChromaDB embedding search
    return {
        "query": q,
        "results": [],
        "message": "TKDL vector search endpoint ready. Configure VECTOR_DB_URL and EMBEDDING_MODEL in .env to activate."
    }


# ---------------------------------------------------------------------------
# Patent Prior-Art Check Endpoint
# ---------------------------------------------------------------------------

@app.get("/api/v1/patent/prior-art", tags=["Patent"])
async def check_prior_art(formulation: str, jurisdiction: str = "INDIA"):
    """
    Queries the IPO (Indian Patent Office) patent vector store for prior-art matches.
    Evaluates Section 3(p) and 3(d) bars under the Patents Act 1970/2024.
    """
    return {
        "formulation": formulation,
        "jurisdiction": jurisdiction,
        "prior_art_matches": [],
        "message": "Patent prior-art endpoint ready. Configure PATENT_VECTOR_STORE in .env to activate."
    }


# ---------------------------------------------------------------------------
# NBA ABS Duty Check Endpoint
# ---------------------------------------------------------------------------

@app.get("/api/v1/abs/check", tags=["Biodiversity"])
async def check_abs_duty(botanical_name: str):
    """
    Checks National Biodiversity Authority (NBA) ABS duty requirements
    under Biological Diversity Act 2002 (Amended 2023).
    """
    return {
        "botanical_name": botanical_name,
        "abs_applicable": None,
        "message": "ABS duty endpoint ready. Configure NBA_API_KEY in .env to activate live lookups."
    }


# ---------------------------------------------------------------------------
# Multilingual — Bhashini Translation
# ---------------------------------------------------------------------------

@app.post("/api/v1/translate", tags=["Multilingual"])
async def translate_text(text: str, source_lang: str = "en", target_lang: str = "hi"):
    """
    Translates audit response text using the Bhashini ULCA platform.
    Supports: en, hi, sa, ta, te, kn, ml, bn, gu, mr, pa, ur
    Configure BHASHINI_API_KEY and BHASHINI_USER_ID in .env to activate.
    """
    from services.bhashini_client import translate, is_supported_language
    if not is_supported_language(target_lang):
        raise HTTPException(status_code=400, detail=f"Unsupported target language: {target_lang}")
    translated = await translate(text, source_lang=source_lang, target_lang=target_lang)
    return {"original": text, "translated": translated, "source_lang": source_lang, "target_lang": target_lang}


@app.get("/api/v1/languages", tags=["Multilingual"])
async def list_languages():
    """Returns all supported languages for multilingual delivery via Bhashini."""
    from services.bhashini_client import get_supported_languages
    return {"languages": get_supported_languages()}


# ---------------------------------------------------------------------------
# Corpus Status
# ---------------------------------------------------------------------------

@app.get("/api/v1/corpus/status", tags=["System"])
async def corpus_status():
    """
    Returns ingestion status of the statutory corpus.
    Run scripts/ingest_corpus.py to populate.
    """
    import importlib
    chroma_dir = os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma_db")
    try:
        chromadb = importlib.import_module("chromadb")
        client = chromadb.PersistentClient(path=chroma_dir)
        collections = client.list_collections()
        status = {c.name: c.count() for c in collections}
        total = sum(status.values())
        return {"status": "ready" if total > 0 else "empty", "collections": status, "total_chunks": total}
    except ImportError:
        return {"status": "unavailable", "error": "chromadb package not installed in environment", "hint": "Run: pip install -r requirements.txt && python scripts/ingest_corpus.py"}
    except Exception as e:
        return {"status": "unavailable", "error": str(e), "hint": "Run: python scripts/ingest_corpus.py"}


# ---------------------------------------------------------------------------
# Static Frontend Serving (For Railway Single-Container Production Deploy)
# ---------------------------------------------------------------------------

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if not os.path.exists(dist_path):
    dist_path = "dist"

if os.path.exists(dist_path):
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        target_file = os.path.join(dist_path, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_path, "index.html"))


# ---------------------------------------------------------------------------
# Static Frontend Serving (For Railway Single-Container Production Deploy)
# ---------------------------------------------------------------------------

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if not os.path.exists(dist_path):
    dist_path = "dist"

if os.path.exists(dist_path):
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        target_file = os.path.join(dist_path, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_path, "index.html"))


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development",
        log_level="info"
    )
