export type SourceChunk = { chunk_id: string; text: string; score: number };

export type UploadResponse = { document_id: string; chunks_indexed: number };

export type AskResponse = { answer: string; sources: SourceChunk[] };

export type HealthResponse = { ok: boolean; ready: boolean };

