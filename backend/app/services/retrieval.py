from __future__ import annotations

from app.core.config import settings
from app.services.llm import answer_from_chunks
from app.store.faiss_store import FaissStore, RetrievedChunk


async def retrieve_top_chunks(*, store: FaissStore, query: str, top_k: int = 3) -> list[RetrievedChunk]:
    """
    Convert query -> embedding, search FAISS, return top_k chunks.
    """
    return await store.search(query=query, top_k=top_k)


async def answer_question(*, store: FaissStore, question: str) -> tuple[str, list[RetrievedChunk]]:
    chunks = await store.search(query=question, top_k=settings.top_k)
    answer = await answer_from_chunks([c.text for c in chunks], question)
    return answer, chunks
