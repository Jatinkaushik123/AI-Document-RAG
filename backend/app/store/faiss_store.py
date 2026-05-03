from __future__ import annotations

import json
import os
from dataclasses import dataclass

import faiss
import numpy as np

from app.core.config import settings
from app.services.llm import embed_texts  # sentence-transformers (local, no API key)


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    text: str
    score: float


class FaissStore:
    """
    Single-document store (reset on each upload) with persistence.
    Saves:
      - index.faiss (FAISS)
      - meta.json (chunk texts + ids)
    """

    def __init__(self) -> None:
        self._index: faiss.Index | None = None
        self._meta: dict[str, str] = {}  # chunk_id -> text
        self._document_id: str | None = None

        self._data_dir = settings.data_dir
        self._index_path = os.path.join(self._data_dir, "index.faiss")
        self._meta_path = os.path.join(self._data_dir, "meta.json")

    async def load_if_present(self) -> None:
        os.makedirs(self._data_dir, exist_ok=True)
        if os.path.exists(self._index_path) and os.path.exists(self._meta_path):
            self._index = faiss.read_index(self._index_path)
            with open(self._meta_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
            self._document_id = payload.get("document_id")
            self._meta = payload.get("chunks", {})

    async def reset(self) -> None:
        os.makedirs(self._data_dir, exist_ok=True)
        self._index = None
        self._meta = {}
        self._document_id = None
        for p in (self._index_path, self._meta_path):
            if os.path.exists(p):
                os.remove(p)

    async def add_texts(self, *, document_id: str, chunks: list[str]) -> None:
        if not chunks:
            raise ValueError("chunks is empty")

        embeddings = await embed_texts(chunks)
        vectors = np.array(embeddings, dtype="float32")
        dim = vectors.shape[1]

        self._index = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(vectors)
        self._index.add(vectors)

        self._document_id = document_id
        self._meta = {f"{document_id}:{i}": chunks[i] for i in range(len(chunks))}

    async def persist(self) -> None:
        if self._index is None or self._document_id is None:
            raise RuntimeError("Nothing to persist. Upload a document first.")
        os.makedirs(self._data_dir, exist_ok=True)
        faiss.write_index(self._index, self._index_path)
        with open(self._meta_path, "w", encoding="utf-8") as f:
            json.dump(
                {"document_id": self._document_id, "chunks": self._meta},
                f,
                ensure_ascii=False,
            )

    def is_ready(self) -> bool:
        return self._index is not None and bool(self._meta)

    async def search(self, *, query: str, top_k: int) -> list[RetrievedChunk]:
        if self._index is None:
            raise RuntimeError("Index not loaded. Upload a document first.")

        [q_emb] = await embed_texts([query])
        q_vec = np.array([q_emb], dtype="float32")
        faiss.normalize_L2(q_vec)

        scores, idxs = self._index.search(q_vec, top_k)
        scores_list = scores[0].tolist()
        idxs_list = idxs[0].tolist()

        chunk_items = list(self._meta.items())
        out: list[RetrievedChunk] = []
        for score, idx in zip(scores_list, idxs_list):
            if idx < 0 or idx >= len(chunk_items):
                continue
            chunk_id, text = chunk_items[idx]
            out.append(RetrievedChunk(chunk_id=chunk_id, text=text, score=float(score)))
        return out
