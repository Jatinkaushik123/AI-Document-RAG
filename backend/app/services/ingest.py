from __future__ import annotations

import uuid

from pypdf import PdfReader

from app.core.config import settings
from app.store.faiss_store import FaissStore
from app.utils.text import chunk_text, normalize_text


def _extract_pdf_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    pages_text: list[str] = []
    for page in reader.pages:
        t = page.extract_text() or ""
        t = normalize_text(t)
        if t:
            pages_text.append(t)
    return "\n".join(pages_text).strip()


async def ingest_pdf(*, store: FaissStore, pdf_path: str) -> tuple[str, int]:
    """
    Returns (document_id, chunks_indexed).
    """
    text = _extract_pdf_text(pdf_path)
    if not text:
        raise ValueError("No extractable text found in the PDF.")

    chunks = chunk_text(
        text,
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )
    if not chunks:
        raise ValueError("Chunking produced no chunks.")

    document_id = str(uuid.uuid4())
    await store.reset()
    await store.add_texts(document_id=document_id, chunks=chunks)
    await store.persist()
    return document_id, len(chunks)
