"""
IP-SAKTI Sahayak — SQLite Audit Session & History Persistence
---------------------------------------------------------------
Stores all user audit queries, 4-agent reasoning steps, classifications,
and readiness scores into a local SQLite database (./data/ipsakti_history.db).
"""
import sqlite3
import json
import time
import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Indian Standard Timezone (IST - UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

DB_PATH = Path(os.getenv("HISTORY_DB_PATH", "./data/ipsakti_history.db"))


def _get_connection() -> sqlite3.Connection:
    """Returns a connection to the SQLite history database, creating tables if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema for audit history sessions."""
    conn = _get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_history (
                query_id TEXT PRIMARY KEY,
                user_query TEXT NOT NULL,
                jurisdiction TEXT NOT NULL,
                law_year TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                formatted_time TEXT NOT NULL,
                overall_score INTEGER NOT NULL,
                category_title TEXT NOT NULL,
                full_payload TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_history(timestamp DESC)")
    conn.close()
    logger.info("SQLite Audit History DB initialized at %s", DB_PATH)


def save_audit_session(audit_result: Dict[str, Any]) -> None:
    """Persists a completed audit result payload into SQLite."""
    try:
        init_db()
        query_id = audit_result.get("query_id", f"audit-{int(time.time())}")
        user_query = audit_result.get("user_query", "")
        jurisdiction = audit_result.get("jurisdiction", "INDIA")
        law_year = audit_result.get("law_year", "2024")
        now_ts = int(time.time())
        formatted_time = datetime.now(IST).strftime("%b %d, %I:%M %p")
        
        overall_score = audit_result.get("readiness_passport", {}).get("overall_score", 70)
        category_title = audit_result.get("classification", {}).get("title", "AYUSH IPR Audit")
        
        payload_str = json.dumps(audit_result)

        cleaned_query = user_query.strip().lower()
        conn = _get_connection()
        with conn:
            # Clean up prior instances of the exact same query to avoid duplicate flooding
            if cleaned_query:
                conn.execute("DELETE FROM audit_history WHERE TRIM(LOWER(user_query)) = ?", (cleaned_query,))
            conn.execute("""
                INSERT OR REPLACE INTO audit_history 
                (query_id, user_query, jurisdiction, law_year, timestamp, formatted_time, overall_score, category_title, full_payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (query_id, user_query, jurisdiction, law_year, now_ts, formatted_time, overall_score, category_title, payload_str))
        conn.close()
        logger.info("Saved audit session '%s' to SQLite history DB", query_id)
    except Exception as e:
        logger.error("Failed to save audit session to SQLite: %s", e)


def get_all_audit_sessions(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent audit sessions from SQLite, deduplicating identical queries."""
    try:
        init_db()
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT query_id, user_query, jurisdiction, law_year, timestamp, formatted_time, overall_score, category_title, full_payload
            FROM audit_history
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit * 2,))
        rows = cursor.fetchall()
        conn.close()

        items = []
        seen_queries = set()
        for row in rows:
            try:
                full_result = json.loads(row["full_payload"])
            except Exception:
                full_result = {}

            user_q = row["user_query"] or ""
            norm_q = user_q.strip().lower()
            if norm_q and norm_q in seen_queries:
                continue
            if norm_q:
                seen_queries.add(norm_q)

            query_snippet = user_q[:36] + ("..." if len(user_q) > 36 else "") if user_q else row["category_title"]

            items.append({
                "id": row["query_id"],
                "query": user_q,
                "title": query_snippet,
                "category": row["category_title"],
                "timestamp": row["formatted_time"],
                "score": row["overall_score"],
                "jurisdiction": row["jurisdiction"],
                "result": full_result
            })
            if len(items) >= limit:
                break
        return items
    except Exception as e:
        logger.error("Failed to fetch audit history from SQLite: %s", e)
        return []


def get_audit_session_by_id(query_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a specific audit session payload by ID."""
    try:
        init_db()
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT full_payload FROM audit_history WHERE query_id = ?", (query_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row["full_payload"])
        return None
    except Exception as e:
        logger.error("Failed to fetch session %s: %s", query_id, e)
        return None


def delete_audit_session(query_id: str) -> bool:
    """Deletes a single audit session by its query_id."""
    try:
        init_db()
        conn = _get_connection()
        with conn:
            cursor = conn.execute("DELETE FROM audit_history WHERE query_id = ?", (query_id,))
            deleted = cursor.rowcount > 0
        conn.close()
        return deleted
    except Exception as e:
        logger.error("Failed to delete audit session %s: %s", query_id, e)
        return False


def clear_audit_history() -> bool:
    """Clears all stored audit session history."""
    try:
        init_db()
        conn = _get_connection()
        with conn:
            conn.execute("DELETE FROM audit_history")
        conn.close()
        return True
    except Exception as e:
        logger.error("Failed to clear audit history: %s", e)
        return False
