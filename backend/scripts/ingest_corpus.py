"""
IP-SAKTI — Statutory Corpus Manager & Ingestion Script
--------------------------------------------------------
Downloads all public statutory documents and indexes them into ChromaDB.
Run once to bootstrap the RAG knowledge base:

    python scripts/ingest_corpus.py

Then re-run whenever statutes are updated (e.g. after a new amendment).

Corpus sources:
  National:     Patents Act, BD Act, Drugs & Cosmetics Act, FSSAI, TKDL
  International: WIPO GRATK, Nagoya Protocol, TRIPS, EMA THMPD

Requires: pip install chromadb sentence-transformers pypdf httpx
"""
from __future__ import annotations
import asyncio
import hashlib
import io
import logging
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# ---------------------------------------------------------------------------
# Corpus Registry — All statutory public documents
# ---------------------------------------------------------------------------

@dataclass
class CorpusSource:
    id: str
    name: str
    url: str                           # Direct PDF or page URL
    jurisdiction: str                  # INDIA | INTERNATIONAL
    category: str                      # PATENT | BIODIVERSITY | TRADEMARK | REGULATORY | TREATY
    authority_level: str               # STATUTORY_PRIMARY | TREATY_INTERNATIONAL | REGULATORY_NOTIFICATION
    effective_year: str
    collection: str                    # ChromaDB collection name
    tags: list[str] = field(default_factory=list)


CORPUS_REGISTRY: list[CorpusSource] = [
    # =========================================================================
    # INDIA — PRIMARY STATUTES
    # =========================================================================
    CorpusSource(
        id="patents-act-1970",
        name="Patents Act 1970 (Amended 2024)",
        url="https://ipindia.gov.in/writereaddata/Portal/IPOGuidelinesManuals/1_31_1_patent-office-manual.pdf",
        jurisdiction="INDIA", category="PATENT",
        authority_level="STATUTORY_PRIMARY", effective_year="2024",
        collection="ayush_statutory_corpus",
        tags=["section3p", "section3d", "novelty", "patent", "ipr"]
    ),
    CorpusSource(
        id="bd-act-2002-2023",
        name="Biological Diversity Act 2002 (Amended 2023)",
        url="https://nbaindia.org/uploaded/pdf/Biological_Diversity_Rules_2004.pdf",
        jurisdiction="INDIA", category="BIODIVERSITY",
        authority_level="STATUTORY_PRIMARY", effective_year="2023",
        collection="ayush_statutory_corpus",
        tags=["abs", "nba", "section6", "nagoya", "biodiversity"]
    ),
    CorpusSource(
        id="bd-rules-2024",
        name="Biological Diversity (Amendment) Rules 2024",
        url="https://nbaindia.org/content/25/19/1/policy.html",
        jurisdiction="INDIA", category="BIODIVERSITY",
        authority_level="STATUTORY_PRIMARY", effective_year="2024",
        collection="ayush_statutory_corpus",
        tags=["abs", "nba", "form3", "benefit-sharing"]
    ),
    CorpusSource(
        id="trademark-act-1999",
        name="Trade Marks Act 1999",
        url="https://ipindia.gov.in/writereaddata/Portal/ev/acts_rules/1-13-1the-trade-marks-act-1999.pdf",
        jurisdiction="INDIA", category="TRADEMARK",
        authority_level="STATUTORY_PRIMARY", effective_year="2017",
        collection="ayush_statutory_corpus",
        tags=["trademark", "brand", "class5", "distinctive"]
    ),
    CorpusSource(
        id="gi-act-1999",
        name="Geographical Indications of Goods (Registration and Protection) Act 1999",
        url="https://ipindia.gov.in/writereaddata/Portal/ev/acts_rules/1-51-1the-geographical-indications-of-goods.pdf",
        jurisdiction="INDIA", category="GI",
        authority_level="STATUTORY_PRIMARY", effective_year="1999",
        collection="ayush_statutory_corpus",
        tags=["gi", "geographical-indication", "darjeeling", "basmati"]
    ),
    CorpusSource(
        id="designs-act-2000",
        name="Designs Act 2000",
        url="https://ipindia.gov.in/writereaddata/Portal/ev/acts_rules/1-91-1designs-act-2000.pdf",
        jurisdiction="INDIA", category="DESIGN",
        authority_level="STATUTORY_PRIMARY", effective_year="2000",
        collection="ayush_statutory_corpus",
        tags=["design", "packaging", "container", "shape"]
    ),
    CorpusSource(
        id="ppvfr-act-2001",
        name="Protection of Plant Varieties and Farmers' Rights Act 2001",
        url="https://ppvfra.gov.in/UploadedFiles/pdf/en/3202216413412016PPVFRA.pdf",
        jurisdiction="INDIA", category="PLANT_VARIETY",
        authority_level="STATUTORY_PRIMARY", effective_year="2001",
        collection="ayush_statutory_corpus",
        tags=["plant-variety", "farmers-rights", "breeder", "cultivar"]
    ),
    CorpusSource(
        id="drugs-cosmetics-act-1940",
        name="Drugs and Cosmetics Act 1940 (Schedule T & First Schedule)",
        url="https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Drugs/Drugs_Cosmetics/DCA1940.pdf",
        jurisdiction="INDIA", category="REGULATORY",
        authority_level="STATUTORY_PRIMARY", effective_year="2020",
        collection="ayush_statutory_corpus",
        tags=["drugs", "classical", "new-drug", "schedule-t", "first-schedule"]
    ),
    CorpusSource(
        id="fssai-ayurveda-aahar-2022",
        name="FSSAI Ayurveda Aahar (Ayurvedic Food) Regulations 2022",
        url="https://old.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Ayurveda_food_29_03_2022.pdf",
        jurisdiction="INDIA", category="REGULATORY",
        authority_level="REGULATORY_NOTIFICATION", effective_year="2022",
        collection="ayush_statutory_corpus",
        tags=["fssai", "aahar", "nutraceutical", "functional-food", "ayurveda-aahar"]
    ),
    CorpusSource(
        id="drugs-magic-remedies-act-1954",
        name="Drugs and Magic Remedies (Objectionable Advertisements) Act 1954",
        url="https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Drugs/Drugs_Cosmetics/drugs_magic_remedies.pdf",
        jurisdiction="INDIA", category="REGULATORY",
        authority_level="STATUTORY_PRIMARY", effective_year="1954",
        collection="ayush_statutory_corpus",
        tags=["advertising", "claims", "magic-remedies", "labelling"]
    ),
    CorpusSource(
        id="dpdp-act-2023",
        name="Digital Personal Data Protection Act 2023",
        url="https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf",
        jurisdiction="INDIA", category="PRIVACY",
        authority_level="STATUTORY_PRIMARY", effective_year="2023",
        collection="ayush_statutory_corpus",
        tags=["dpdp", "privacy", "data-protection", "consent"]
    ),

    # =========================================================================
    # INTERNATIONAL — TREATIES & GUIDELINES
    # =========================================================================
    CorpusSource(
        id="wipo-gratk-2024",
        name="WIPO Treaty on Genetic Resources and Associated Traditional Knowledge 2024",
        url="https://www.wipo.int/edocs/mdocs/tk/en/wipo_grtkf_ic_47/wipo_grtkf_ic_47_12.pdf",
        jurisdiction="INTERNATIONAL", category="TREATY",
        authority_level="TREATY_INTERNATIONAL", effective_year="2024",
        collection="ayush_statutory_corpus",
        tags=["wipo", "gratk", "traditional-knowledge", "genetic-resources", "disclosure"]
    ),
    CorpusSource(
        id="nagoya-protocol-2010",
        name="Nagoya Protocol on Access and Benefit Sharing (CBD) 2010",
        url="https://www.cbd.int/abs/doc/protocol/nagoya-protocol-en.pdf",
        jurisdiction="INTERNATIONAL", category="TREATY",
        authority_level="TREATY_INTERNATIONAL", effective_year="2014",
        collection="ayush_statutory_corpus",
        tags=["nagoya", "abs", "cbd", "benefit-sharing", "genetic-resources"]
    ),
    CorpusSource(
        id="trips-agreement",
        name="TRIPS Agreement — WTO Agreement on Trade-Related Aspects of IPR",
        url="https://www.wto.org/english/docs_e/legal_e/27-trips_01_e.htm",
        jurisdiction="INTERNATIONAL", category="TREATY",
        authority_level="TREATY_INTERNATIONAL", effective_year="1994",
        collection="ayush_statutory_corpus",
        tags=["trips", "wto", "patent", "trademark", "international"]
    ),
    CorpusSource(
        id="ema-thmpd-guidelines",
        name="EMA Traditional Herbal Medicinal Products Directive (2004/24/EC) Guidelines",
        url="https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-quality-traditional-herbal-medicinal-products_en.pdf",
        jurisdiction="INTERNATIONAL", category="REGULATORY",
        authority_level="REGULATORY_NOTIFICATION", effective_year="2016",
        collection="ayush_statutory_corpus",
        tags=["ema", "europe", "thmpd", "traditional-herbal", "market-access"]
    ),
    CorpusSource(
        id="who-monographs-medicinal-plants",
        name="WHO Monographs on Selected Medicinal Plants (Vol 1-4)",
        url="https://apps.who.int/iris/bitstream/handle/10665/42052/9241545089.pdf",
        jurisdiction="INTERNATIONAL", category="PHARMACOPOEIA",
        authority_level="TREATY_INTERNATIONAL", effective_year="1999",
        collection="tkdl_classical_corpora",
        tags=["who", "monograph", "medicinal-plants", "traditional-medicine"]
    ),
]


# ---------------------------------------------------------------------------
# Downloader
# ---------------------------------------------------------------------------

async def download_pdf(source: CorpusSource, out_dir: Path) -> Optional[Path]:
    """Downloads a PDF statute. Returns local path or None on failure."""
    out_path = out_dir / f"{source.id}.pdf"
    if out_path.exists():
        logger.info("Already downloaded: %s", source.id)
        return out_path

    logger.info("Downloading: %s → %s", source.name, source.url)
    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            resp = await client.get(source.url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")
            # Accept PDF or HTML (we extract text from both)
            out_path.write_bytes(resp.content)
            logger.info("✅ Saved %s (%.1f KB)", source.id, len(resp.content) / 1024)
            return out_path
    except Exception as e:
        logger.warning("❌ Failed to download %s: %s", source.id, e)
        return None


# ---------------------------------------------------------------------------
# Ingestion (ChromaDB)
# ---------------------------------------------------------------------------

def ingest_to_chromadb(source: CorpusSource, pdf_path: Path, chroma_dir: str):
    """Extracts text from PDF and upserts into ChromaDB with metadata."""
    try:
        import pypdf
        import chromadb
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
    except ImportError as e:
        logger.error("Missing dependency: %s — run: pip install pypdf chromadb sentence-transformers", e)
        return

    # Extract text
    reader = pypdf.PdfReader(str(pdf_path))
    pages_text = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages_text.append((i + 1, text.strip()))

    if not pages_text:
        logger.warning("No extractable text in %s", source.id)
        return

    # Chunk into ~512-token blocks
    chunks, chunk_ids, metadatas = [], [], []
    for page_num, page_text in pages_text:
        words = page_text.split()
        step = 400  # ~512 tokens ≈ 400 words
        for start in range(0, len(words), step - 64):  # 64-word overlap
            chunk = " ".join(words[start: start + step])
            chunk_id = hashlib.md5(f"{source.id}-p{page_num}-{start}".encode()).hexdigest()
            chunks.append(chunk)
            chunk_ids.append(chunk_id)
            metadatas.append({
                "source_id": source.id,
                "name": source.name,
                "jurisdiction": source.jurisdiction,
                "category": source.category,
                "authority_level": source.authority_level,
                "effective_year": source.effective_year,
                "page": page_num,
                "tags": ",".join(source.tags),
                "url": source.url,
            })

    # Upsert to ChromaDB
    embedding_fn = SentenceTransformerEmbeddingFunction(
        model_name=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    )
    client = chromadb.PersistentClient(path=chroma_dir)
    collection = client.get_or_create_collection(
        name=source.collection,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )

    BATCH = 100
    for i in range(0, len(chunks), BATCH):
        collection.upsert(
            documents=chunks[i: i + BATCH],
            ids=chunk_ids[i: i + BATCH],
            metadatas=metadatas[i: i + BATCH],
        )

    logger.info("✅ Ingested %d chunks from %s into '%s'", len(chunks), source.id, source.collection)


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

async def main():
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")

    out_dir = Path(os.getenv("STATUTORY_DOCS_DIR", "./data/statutes"))
    out_dir.mkdir(parents=True, exist_ok=True)
    chroma_dir = os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma_db")

    logger.info("=" * 60)
    logger.info("IP-SAKTI Corpus Ingestion — %d sources", len(CORPUS_REGISTRY))
    logger.info("Output dir: %s | ChromaDB: %s", out_dir, chroma_dir)
    logger.info("=" * 60)

    for source in CORPUS_REGISTRY:
        pdf_path = await download_pdf(source, out_dir)
        if pdf_path:
            ingest_to_chromadb(source, pdf_path, chroma_dir)

    logger.info("✅ Corpus ingestion complete.")


if __name__ == "__main__":
    asyncio.run(main())
