from __future__ import annotations

import asyncio
from functools import lru_cache

from openai import AsyncOpenAI
from sentence_transformers import SentenceTransformer

from app.core.config import settings


SYSTEM_PROMPT = """You are an AI Document Assistant.
If CONTEXT is provided, prioritize it and do not contradict it.
If CONTEXT is empty, answer normally and clearly.
Keep answers concise and practical."""


def _openai_client() -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")
    return AsyncOpenAI(api_key=settings.openai_api_key)


@lru_cache(maxsize=1)
def _embedding_model() -> SentenceTransformer:
    return SentenceTransformer(settings.embedding_model)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    model = _embedding_model()

    def _encode() -> list[list[float]]:
        emb = model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return emb.tolist()

    return await asyncio.to_thread(_encode)


async def answer_from_chunks(chunk_texts: list[str], question: str) -> str:
    chunks = [c.strip() for c in chunk_texts if c and c.strip()]
    q = (question or "").strip()
    if not q:
        return "Please ask a question."

    context = "\n\n---\n\n".join(chunks)
    client = _openai_client()
    user_prompt = (
        f"CONTEXT:\n{context}\n\nQUESTION:\n{q}"
        if context
        else f"QUESTION:\n{q}"
    )
    resp = await client.responses.create(
        model=settings.openai_model,
        input=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return (resp.output_text or "").strip() or "I could not generate an answer."
