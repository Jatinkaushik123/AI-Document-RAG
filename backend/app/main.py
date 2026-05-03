from __future__ import annotations

import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.schemas import (
    ChatRequest,
    ChatResponse,
    SourceChunk,
    UploadResponse,
)
from app.services.ingest import ingest_pdf
from app.services.llm import answer_from_chunks
from app.services.retrieval import answer_question
from app.store.faiss_store import FaissStore


app = FastAPI(title="Document Q&A API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = FaissStore()


@app.on_event("startup")
async def _startup() -> None:
    await store.load_if_present()


@app.get("/")
async def root() -> str:
    return "Backend running"


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "ready": store.is_ready()}


@app.post("/documents/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    try:
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "upload.pdf")
            content = await file.read()
            with open(path, "wb") as f:
                f.write(content)
            document_id, chunks_indexed = await ingest_pdf(store=store, pdf_path=path)
            return UploadResponse(document_id=document_id, chunks_indexed=chunks_indexed)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to index document.") from e


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        if store.is_ready():
            answer, chunks = await answer_question(store=store, question=req.question)
        else:
            answer, chunks = await answer_from_chunks([], req.question), []
        return ChatResponse(
            answer=(answer or "").strip(),
            sources=[SourceChunk(chunk_id=c.chunk_id, text=c.text, score=c.score) for c in chunks],
        )
    except RuntimeError as e:
        # Common case: missing OPENAI_API_KEY
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Chat failed.") from e


@app.post("/documents/reset")
async def reset() -> dict:
    await store.reset()
    return {"ok": True}

