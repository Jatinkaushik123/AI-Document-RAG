from __future__ import annotations

import re


_whitespace_re = re.compile(r"\s+")
_sentence_split_re = re.compile(r"(?<=[.!?])\s+")


def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ").strip()
    return _whitespace_re.sub(" ", text)


def chunk_text(text: str, *, chunk_size: int, chunk_overlap: int) -> list[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must be >= 0")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be < chunk_size")

    text = normalize_text(text)
    if not text:
        return []

    # Prefer not to cut sentences abruptly:
    # - split into sentences
    # - pack sentences into chunks up to chunk_size
    # - apply overlap using trailing characters from the previous chunk
    sentences = [s.strip() for s in _sentence_split_re.split(text) if s.strip()]
    if not sentences:
        return []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    def flush() -> None:
        nonlocal current, current_len
        if not current:
            return
        chunk = " ".join(current).strip()
        if chunk:
            chunks.append(chunk)
        current = []
        current_len = 0

    def add_with_hard_wrap(s: str) -> None:
        """
        If a single sentence exceeds chunk_size, we hard-wrap it at word boundaries.
        This is a fallback for very long sentences (tables, OCR, etc.).
        """
        words = s.split(" ")
        buf: list[str] = []
        buf_len = 0
        for w in words:
            w = w.strip()
            if not w:
                continue
            add_len = len(w) + (1 if buf else 0)
            if buf_len + add_len > chunk_size and buf:
                chunks.append(" ".join(buf))
                buf = [w]
                buf_len = len(w)
            else:
                buf.append(w)
                buf_len += add_len
        if buf:
            chunks.append(" ".join(buf))

    for s in sentences:
        if len(s) > chunk_size:
            flush()
            add_with_hard_wrap(s)
            continue

        add_len = len(s) + (1 if current else 0)
        if current_len + add_len > chunk_size and current:
            flush()

        current.append(s)
        current_len += add_len

    flush()

    if chunk_overlap == 0 or len(chunks) <= 1:
        return chunks

    # Rebuild with overlap: prefix each chunk (except first) with tail of previous chunk.
    overlapped: list[str] = [chunks[0]]
    for i in range(1, len(chunks)):
        prev = overlapped[-1]
        tail = prev[-chunk_overlap:] if len(prev) > chunk_overlap else prev
        combined = normalize_text(f"{tail} {chunks[i]}")
        # Keep a hard cap (overlap can push slightly over chunk_size).
        overlapped.append(combined[: chunk_size + chunk_overlap].strip())

    return overlapped
