# IP-SAKTI Sahayak

> **Autonomous AYUSH Intellectual Property & Biodiversity Audit Engine**  
> *Protecting AYUSH Innovation and Traditional Knowledge against Global Misappropriation.*

IP-SAKTI Sahayak is an autonomous AI system designed for **Smart India Hackathon Problem Statement 26045** (Ministry of Ayush, Government of India). It addresses the systemic challenge where traditional Ayurvedic, Siddha, and Unani formulations face international patent squatting while Indian innovators struggle with complex statutory compliance across patents, biodiversity ABS duties, and drug regulations.

The platform executes a parallel **4-agent RAG audit pipeline** in seconds, grounding every legal recommendation in the Patents Act 1970/2024, Biological Diversity Act 2002/2023, Traditional Knowledge Digital Library (TKDL) corpora, WIPO GRATK 2024 Treaty, and FSSAI Ayurveda-Aahar regulations.

---

## System Architecture

```
                       User Formulation Query / Uploaded Document
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │         Frontend (Vite + React + TS)          │
                 │  - Immersive Full-Screen Chat Workspace       │
                 │  - Audit History & Session Persistence        │
                 │  - 4-Agent Real-Time Execution Status        │
                 │  - Evidence Graph & Topology Visualizer       │
                 └───────────────────────┬───────────────────────┘
                                         │ REST API (FastAPI)
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │          Backend (FastAPI + Python)           │
                 │                                               │
                 │  Agent 1: RESEARCHER                          │
                 │    └─ Statutory & TKDL Multi-Vector RAG       │
                 │  Agent 2: AUDITOR                             │
                 │    └─ Date-Versioned Compliance Verification   │
                 │  Agent 3: DEVIL'S ADVOCATE                    │
                 │    └─ IPO Examiner Objection Stress-Testing   │
                 │  Agent 4: STRATEGIST                          │
                 │    └─ Actionable IP & ABS Roadmap Synthesis   │
                 │                                               │
                 │  LLM Engine: Groq (LLaMA 4) / Gemini / Ollama │
                 │  Vector Store: ChromaDB / pgvector            │
                 │  Multilingual: Bhashini ULCA / LLM Cascade    │
                 └───────────────────────────────────────────────┘
```

---

## Quick Start

### System Prerequisites
- **Node.js** >= 20.0
- **Python** >= 3.11
- **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com))

---

### 1. Frontend Setup

```bash
# Clone repository
git clone https://github.com/kshitijsingh1-tech/IP-Sakti-sahayak.git
cd IP-Sakti-sahayak

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend application will be accessible at: `http://localhost:5173`

Production build generation:
```bash
npm run build
```

---

### 2. Backend Setup

```bash
cd backend/

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate    # Linux / macOS

# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend service will be accessible at: `http://localhost:8000`  
Interactive OpenAPI documentation: `http://localhost:8000/docs`

---

### 3. Ingest Statutory Corpus into Vector Database

To populate the local ChromaDB vector store with the 17 national and international statutory documents:

```bash
python scripts/ingest_corpus.py
```

---

## Configuration

Copy `backend/.env.example` to `backend/.env` and configure key variables:

| Variable | Requirement | Description |
|---|---|---|
| `GROQ_API_KEY` | Required | Groq LLaMA 4 inference key |
| `GROQ_MODEL` | Required | Model designation (e.g. `meta-llama/llama-4-scout-17b-16e-instruct`) |
| `CHROMA_PERSIST_DIRECTORY` | Required | Local directory path for ChromaDB storage |
| `EMBEDDING_MODEL` | Required | Embedding model name (`sentence-transformers/all-MiniLM-L6-v2`) |
| `CORS_ORIGINS` | Required | Allowed CORS origins (`http://localhost:5173`) |
| `BHASHINI_API_KEY` | Optional | Government of India Bhashini translation key (falls back to LLM) |
| `TKDL_ACCESS_TOKEN` | Institutional | CSIR-NISCPR TKDL API access token |
| `NBA_API_KEY` | Institutional | National Biodiversity Authority API key |

---

## Key Capabilities

### 1. 4-Agent Autonomous Pipeline
- **Researcher**: Retrieves statutory clauses, pharmacopoeial entries, and classical TKDL matches.
- **Auditor**: Evaluates compliance under active law versions (e.g., 2024 Patent Rules, 2023 Biodiversity Amendment).
- **Devil's Advocate**: Simulates Indian Patent Office (IPO) examiner rejection arguments under Sections 3(p) and 3(d).
- **Strategist**: Synthesizes a risk-mitigated patenting and commercialization roadmap.

### 2. Document & Multi-Media Analysis
Upload formulation specifications, laboratory reports, or patent drafts directly in the query bar. Supported formats include:
- **Documents**: PDF, DOCX, TXT, CSV
- **Presentations**: PPT, PPTX
- **Images**: PNG, JPG, WEBP (supports optical character recognition)

### 3. Dual Jurisdiction System
Switch seamlessly between **India** (Patents Act, BD Act, FSSAI) and **International** (WIPO GRATK Treaty, TRIPS, Nagoya Protocol, EMA THMPD) regulatory frameworks. Answers are maintained in distinct datasets to prevent jurisdictional conflation.

### 4. Multilingual Delivery
Supports 12 Indian languages (**English, Hindi, Sanskrit, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Urdu**) using Bhashini ULCA API with automatic zero-config LLM translation fallback.

---

## API Reference

### `POST /api/v1/audit`
Executes the 4-agent audit pipeline.

```json
{
  "query": "Standardized Ashwagandha extract capsule for stress management",
  "jurisdiction": "INDIA",
  "law_year": "2024",
  "language": "en"
}
```

### `POST /api/v1/upload`
Processes uploaded PDF/PPT/Image files and returns structured text context for audit injection.

### `POST /api/v1/translate`
Translates audit text into any supported target language via Bhashini/LLM cascade.

### `GET /api/v1/corpus/status`
Returns ChromaDB vector collection health and chunk count.

### `GET /health`
System health check endpoint.

---

## Repository Structure

```
ip-sakti/
├── src/                            # Frontend (Vite + React + TypeScript)
│   ├── components/
│   │   ├── ChatAssistant.tsx      # ChatGPT-style workspace
│   │   ├── FileUploadButton.tsx   # PDF/PPT/Image upload handler & chips
│   │   ├── AgentPipeline.tsx      # 4-Agent execution status display
│   │   ├── LandingHero.tsx        # Hero landing page & search capsule
│   │   ├── EvidenceGraph.tsx      # Statutory evidence topology graph
│   │   ├── ReadinessPassport.tsx  # IP Readiness Passport score card
│   │   └── ABSChecker.tsx         # Biodiversity ABS duty verification
│   ├── services/
│   │   └── aiEngine.ts            # Frontend client engine
│   └── types/
│       └── index.ts               # Core TypeScript definitions
│
├── backend/                       # Backend (FastAPI + Python)
│   ├── main.py                    # Server entry point & API endpoints
│   ├── scripts/
│   │   └── ingest_corpus.py       # Corpus ingestion script (17 statutes)
│   ├── services/
│   │   ├── document_processor.py  # PDF/PPT/DOCX/CSV/OCR text extractor
│   │   ├── llm_layer.py           # Multi-provider LLM fallback chain
│   │   ├── bhashini_client.py     # Bhashini & LLM translation cascade
│   │   └── rag_pipeline.py        # 4-Agent async pipeline orchestrator
│   ├── requirements.txt           # Python dependency requirements
│   └── .env.example               # Environment template
│
├── README.md
└── package.json
```

---

## Legal Corpus Coverage

| Statutory Instrument | Regulatory Focus | Status |
|---|---|---|
| Patents Act 1970 (Amended 2024) | Patent eligibility, Sections 3(p), 3(d), 3(j) | Integrated |
| Biological Diversity Act 2002 (Amended 2023) | NBA Section 6 pre-approval & ABS duties | Integrated |
| Ayurvedic Pharmacopoeia of India (API) | Classical formulation reference standards | Integrated |
| Traditional Knowledge Digital Library (TKDL) | Prior-art protection against biopiracy | Integrated |
| WIPO GRATK Treaty 2024 | Mandatory international TK disclosure | Integrated |
| FSSAI Ayurveda Aahar Regulations 2022 | Functional food & nutraceutical pathway | Integrated |
| EMA THMPD (European Union) | Herbal product export compliance | Integrated |
| Digital Personal Data Protection Act 2023 | User data privacy & audit compliance | Integrated |

---

## Legal Disclaimer

IP-SAKTI Sahayak provides source-cited legal and regulatory information grounded in official statutory texts and traditional knowledge databases. This system does not provide formal legal advice. Users should consult a qualified Patent Agent or AYUSH IP Facilitator for official filings.

---

## Hackathon Reference

- **Problem Statement**: SIH 26045 (Smart India Hackathon 2024)
- **Title**: Intellectual Property Rights & Biodiversity Protection for AYUSH Sector
- **Ministry**: Ministry of Ayush, Government of India
