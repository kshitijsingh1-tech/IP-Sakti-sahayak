# IP-SAKTI Sahayak 🌿⚖️

> **Protect your AYUSH Innovation before someone else patents it.**

IP-SAKTI Sahayak is an **Autonomous AYUSH IP & Biodiversity Audit Engine** built for SIH Problem Statement **26045**. Traditional Ayurvedic formulations are being patented abroad while Indian MSMEs, practitioners, and researchers remain unprotected. IP-SAKTI changes that — running a **4-agent parallel RAG audit pipeline** in seconds, grounding every legal claim in the Patents Act 1970/2024, Biological Diversity Act 2023, TKDL Sanskrit corpora, and WIPO GRATK 2024.

---

## 🧠 System Architecture

```
User Formulation Query
        │
        ▼
┌─────────────────────────────────────┐
│    Frontend (Vite + React + TS)     │
│  • Chat Workspace (ChatGPT-style)   │
│  • Audit History Sidebar            │
│  • 4-Agent Pipeline Status Cards   │
│  • Evidence Graph Visualiser        │
└──────────────┬──────────────────────┘
               │ REST API (FastAPI)
               ▼
┌─────────────────────────────────────┐
│     Backend (FastAPI + Python)      │
│                                     │
│  Agent 1: RESEARCHER               │
│    └─ Statutory + TKDL RAG         │
│  Agent 2: AUDITOR                  │
│    └─ Date-versioned compliance     │
│  Agent 3: DEVILS ADVOCATE          │
│    └─ IPO examiner stress-test      │
│  Agent 4: STRATEGIST               │
│    └─ IP + ABS roadmap synthesis    │
│                                     │
│  LLM: Groq (LLaMA 4 / Mixtral)    │
│  Vector DB: ChromaDB / pgvector    │
│  Embeddings: SBERT MiniLM          │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20 (for frontend)
- **Python** ≥ 3.11 (for backend)
- **Groq API Key** — free at [console.groq.com](https://console.groq.com)

---

### 1️⃣ Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-team/ip-sakti.git
cd ip-sakti

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

App runs at → `http://localhost:5173`

> **Build for production:**
> ```bash
> npm run build
> # Outputs to dist/
> ```

---

### 2️⃣ Backend Setup

```bash
cd backend/

# Create Python virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your API keys (see Configuration section below)

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API runs at → `http://localhost:8000`  
Swagger docs at → `http://localhost:8000/docs`

---

## ⚙️ Configuration

Copy `backend/.env.example` to `backend/.env` and configure the following critical fields:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | LLM provider key — [get free key](https://console.groq.com) |
| `GROQ_MODEL` | ✅ Yes | e.g. `meta-llama/llama-4-scout-17b-16e-instruct` |
| `CHROMA_PERSIST_DIRECTORY` | ✅ Yes | Local path for ChromaDB vector store |
| `EMBEDDING_MODEL` | ✅ Yes | `sentence-transformers/all-MiniLM-L6-v2` |
| `CORS_ORIGINS` | ✅ Yes | Frontend origin e.g. `http://localhost:5173` |
| `POSTGRES_URL` | ⚠️ Production | PostgreSQL + pgvector connection string |
| `NBA_API_KEY` | ⚠️ Production | National Biodiversity Authority live lookup |
| `TKDL_ACCESS_TOKEN` | ⚠️ Production | CSIR-NISCPR TKDL API token |

---

## 🔬 How to Use

### Running an Audit

1. **Open the app** at `http://localhost:5173`
2. **Enter a formulation query** in the search bar on the Hero page, e.g.:
   > *"I have a standardized Ashwagandha + Guduchi extract capsule for stress management. Can I patent it in India and sell it in Germany as an Ayurvedic medicine?"*
3. Click **"Audit Formulation"** — this triggers the 4-agent pipeline.
4. You land on the **Chat Workspace** where you can see:
   - 🔍 **Researcher** — statutory & TKDL evidence retrieved
   - ⚖️ **Auditor** — legal compliance verified against the active law version
   - ⚠️ **Devil's Advocate** — IPO examiner objections simulated
   - 🗺️ **Strategist** — actionable IP + ABS roadmap generated
5. Scroll down to review **IP Protection Grid**, **Evidence Graph**, and **Statutory Citations**.
6. Click **"Export Passport PDF"** to download your IP Readiness Passport.

### Switching Jurisdiction

Use the **`🇮🇳 IN` / `🌐 Global`** toggle in the top bar to switch between Indian (Patents Act / BD Act) and International (WIPO GRATK / EU THMPD) regulatory regimes.

### Audit History

Your audit sessions are saved in the **collapsible left sidebar** under *Recent Audits*. Click any past audit to reload its full results.

### Pre-Built Validation Scenarios

On the Hero page, scroll to **"Launch Pre-Built Validation Scenarios"** and click any of the 4 sample formulations to test the pipeline end-to-end:
- Ashwagandha + Guduchi Extract (India → Germany export)
- Modified Classical Chyawanprash (novel processing)
- Ayurveda-Aahar Herbal Tea (FSSAI functional food)
- Standardised Curcumin Phytopharmaceutical (CDSCO pathway)

---

## 📡 API Reference

### `POST /api/v1/audit`

Runs the 4-agent autonomous audit pipeline.

**Request Body:**
```json
{
  "query": "Standardized Ashwagandha extract capsule for stress management",
  "jurisdiction": "INDIA",
  "law_year": "2024",
  "language": "en"
}
```

**Response:** Full `AuditResponse` object containing:
- `classification` — Regulatory category (Classical / Proprietary / Phytopharmaceutical / Aahar)
- `agent_steps` — 4-agent reasoning chain with findings
- `citations` — Source-cited statutory & pharmacopoeial references
- `readiness_passport` — Scored IP readiness across 5 dimensions

### `GET /api/v1/tkdl/search?q=<term>&top_k=5`

Vector similarity search over TKDL classical corpora.

### `GET /api/v1/patent/prior-art?formulation=<name>&jurisdiction=INDIA`

Checks IPO patent vector store for Section 3(p)/3(d) prior-art risk.

### `GET /api/v1/abs/check?botanical_name=<name>`

NBA Biological Diversity Act compliance duty check.

### `GET /health`

System health and provider status.

---

## 🗂️ Project Structure

```
ip-sakti/
├── src/                          # Vite + React Frontend
│   ├── components/
│   │   ├── ChatAssistant.tsx    # Full-screen ChatGPT workspace
│   │   ├── AgentPipeline.tsx    # 4-Agent pipeline status cards
│   │   ├── LandingHero.tsx      # Hero landing page
│   │   ├── Header.tsx           # Floating capsule navigation bar
│   │   ├── EvidenceGraph.tsx    # Statutory evidence topology graph
│   │   ├── TKDLRadar.tsx        # Traditional Knowledge Radar view
│   │   ├── ABSChecker.tsx       # Biodiversity ABS duty checker
│   │   ├── ReadinessPassport.tsx# IP Readiness Passport
│   │   └── ProductClassifier.tsx# AYUSH product classification wizard
│   ├── services/
│   │   └── aiEngine.ts          # Mock RAG engine (replace with backend API)
│   ├── data/
│   │   └── mockData.ts          # Sample queries & master citations
│   └── types/
│       └── index.ts             # TypeScript types for all data models
│
├── backend/                     # FastAPI Backend
│   ├── main.py                  # API server with all endpoints
│   ├── services/
│   │   └── rag_pipeline.py      # 4-Agent async pipeline orchestrator
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment configuration template
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 📚 Legal Corpus Reference

| Corpus | Description | Status |
|---|---|---|
| Patents Act 1970 (Amended 2024) | Indian patent eligibility, Sec 3(p), 3(d) | ✅ Integrated |
| Biological Diversity Act 2002 (Amended 2023) | NBA ABS duties, Section 6 | ✅ Integrated |
| Ayurvedic Pharmacopoeia of India (API) | Classical formula reference | ✅ Integrated |
| TKDL Sanskrit / Tamil Corpora | Traditional Knowledge Digital Library | ⚠️ API key required |
| WIPO GRATK 2024 Treaty | International TK disclosure obligations | ✅ Integrated |
| FSSAI Ayurveda Aahar Regulations 2022 | Functional food pathway | ✅ Integrated |
| EMA THMPD Guidelines | EU Traditional Herbal Medicinal Products | ✅ Integrated |

---

## ⚠️ Disclaimer

IP-SAKTI Sahayak provides **source-cited legal and regulatory information** grounded in official statutes and traditional knowledge corpora. This information does **not constitute formal legal advice**. Consult a registered Patent Agent or AYUSH IP Facilitator for official filings and prosecutions.

---

## 🏆 SIH 26045

Built by Team IP-SAKTI for **Smart India Hackathon 2024 — Problem Statement 26045**  
Category: **Intellectual Property Rights & Biodiversity for AYUSH Sector**  
Ministry: **Ministry of Ayush, Government of India**
