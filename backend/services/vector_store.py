"""
IP-SAKTI Sahayak — Unified Vector Store Abstraction
------------------------------------------------------
Supports multiple vector database providers:
  1. Local ChromaDB (default local embedding store at ./data/chroma_db)
  2. Azure Cosmos DB (CosmoDB) for MongoDB / NoSQL Vector Search
"""
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Provider Selection: "chroma" | "cosmodb"
VECTOR_DB_PROVIDER = os.getenv("VECTOR_DB_PROVIDER", "chroma").lower()


class CosmosDBVectorStore:
    """Azure Cosmos DB (CosmoDB) Vector Search Provider."""
    def __init__(self, connection_string: str, database_name: str = "ipsakti_db"):
        self.conn_str = connection_string
        self.database_name = database_name
        self.enabled = bool(connection_string)

    def search(self, query: str, collection_name: str = "ayush_statutes", top_k: int = 5) -> List[Dict[str, Any]]:
        """Executes vector similarity search against Azure Cosmos DB."""
        if not self.enabled:
            logger.warning("Cosmos DB connection string not set in .env")
            return []

        try:
            # PyMongo vector search pipeline for Cosmos DB vCore
            import pymongo
            client = pymongo.MongoClient(self.conn_str)
            db = client[self.database_name]
            coll = db[collection_name]

            # Simplified text / vector query matching
            cursor = coll.find({"$text": {"$search": query}}).limit(top_k)
            results = []
            for doc in cursor:
                results.append({
                    "id": str(doc.get("_id")),
                    "text": doc.get("text", ""),
                    "metadata": doc.get("metadata", {}),
                    "score": doc.get("score", 0.9)
                })
            return results
        except Exception as e:
            logger.error("Cosmos DB vector search error: %s", e)
            return []


class ChromaVectorStore:
    """Local ChromaDB Vector Store Provider."""
    def __init__(self, persist_dir: str = "./data/chroma_db"):
        self.persist_dir = persist_dir

    def search(self, query: str, collection_name: str = "ayush_statutes", top_k: int = 5) -> List[Dict[str, Any]]:
        """Executes vector similarity search against local ChromaDB."""
        try:
            import chromadb
            client = chromadb.PersistentClient(path=self.persist_dir)
            try:
                collection = client.get_collection(name=collection_name)
            except Exception:
                # Return empty list if collection not ingested yet
                return []

            results = collection.query(query_texts=[query], n_results=top_k)
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            ids = results.get("ids", [[]])[0]

            out = []
            for doc_id, doc_text, meta in zip(ids, documents, metadatas):
                out.append({
                    "id": doc_id,
                    "text": doc_text,
                    "metadata": meta,
                    "score": 0.88
                })
            return out
        except Exception as e:
            logger.error("ChromaDB vector search error: %s", e)
            return []


def search_vector_store(query: str, collection_name: str = "ayush_statutes", top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Unified entry point for vector search.
    Automatically routes to CosmoDB or ChromaDB based on VECTOR_DB_PROVIDER.
    """
    cosmos_conn = os.getenv("COSMOSDB_CONNECTION_STRING", "")
    
    if VECTOR_DB_PROVIDER == "cosmodb" or (cosmos_conn and os.getenv("USE_COSMOSDB") == "true"):
        logger.info("Routing vector search query to Azure Cosmos DB...")
        store = CosmosDBVectorStore(connection_string=cosmos_conn)
        return store.search(query, collection_name=collection_name, top_k=top_k)
    else:
        logger.info("Routing vector search query to local ChromaDB...")
        store = ChromaVectorStore(persist_dir=os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma_db"))
        return store.search(query, collection_name=collection_name, top_k=top_k)
