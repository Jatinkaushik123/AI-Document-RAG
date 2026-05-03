import type { AskResponse, HealthResponse, SourceChunk, UploadResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function parseError(r: Response): Promise<string> {
  try {
    const j = await r.json();
    return typeof j?.detail === "string" ? j.detail : JSON.stringify(j);
  } catch {
    return await r.text();
  }
}

export async function health(): Promise<HealthResponse> {
  const r = await fetch(`${API_BASE_URL}/health`);
  if (!r.ok) throw new Error(await parseError(r));
  return r.json();
}

export function uploadAndIndexPdf(file: File, onProgress?: (ratio: number) => void): Promise<UploadResponse> {
  const url = `${API_BASE_URL}/documents/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const r = Math.min(0.95, e.loaded / e.total);
        onProgress?.(r);
      } else {
        onProgress?.(0.2);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        const body = xhr.response as UploadResponse | null;
        if (body?.document_id) {
          resolve(body);
          return;
        }
      }
      const typed = xhr.response as { detail?: string } | null;
      const detail =
        typeof typed?.detail === "string"
          ? typed.detail
          : xhr.statusText || `Upload failed (${xhr.status}).`;
      reject(new Error(detail));
    };

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
    onProgress?.(0.04);
  });
}

export async function ask(question: string): Promise<AskResponse> {
  const r = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!r.ok) throw new Error(await parseError(r));
  return r.json();
}

export async function retrieve(query: string): Promise<{ chunks: SourceChunk[] }> {
  const r = await fetch(`${API_BASE_URL}/retrieve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(await parseError(r));
  return r.json();
}
