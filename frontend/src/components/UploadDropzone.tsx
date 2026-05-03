import { CheckCircle2, FileUp, X } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Spinner } from "./Spinner";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function UploadDropzone({
  file,
  disabled,
  uploading,
  progress,
  uploadSuccess,
  onPick,
  onClear,
}: {
  file: File | null;
  disabled?: boolean;
  uploading?: boolean;
  progress?: number;
  uploadSuccess?: boolean;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function handleFiles(fs: FileList | null) {
    const f = fs?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    onPick(f);
  }

  const pct = Math.round(Math.min(1, Math.max(0, progress ?? 0)) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={[
        "glass glow-panel rounded-3xl border p-4 transition-colors",
        dragOver ? "border-violet-400/45 bg-white/10 shadow-[0_0_40px_rgba(139,92,246,0.35)]" : "border-white/10",
      ].join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
            <FileUp className="h-5 w-5 text-white/80" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/95">Add your PDF</div>
            <div className="text-xs leading-relaxed text-white/55">Drag & drop, or browse. We&apos;ll analyze it privately in your workspace.</div>
          </div>
        </div>

        {file ? (
          <button className="btn rounded-xl px-3 py-2 text-xs" type="button" onClick={onClear} disabled={disabled || uploading}>
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        className={[
          "relative mt-4 w-full overflow-hidden rounded-2xl border px-5 py-6 text-left transition",
          uploading ? "border-cyan-400/25 bg-black/35" : "border-dashed border-white/14 bg-black/22 hover:bg-black/28",
          uploadSuccess ? "border-emerald-400/35 bg-emerald-500/10" : "",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <AnimatePresence mode="wait">
          {uploadSuccess ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                <CheckCircle2 className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]" />
              </motion.div>
              <div>
                <div className="text-sm font-semibold text-emerald-100">Document indexed successfully ✅</div>
                <div className="mt-1 text-xs text-emerald-100/70">{file?.name ?? "PDF"} • {file ? formatBytes(file.size) : ""}</div>
              </div>
            </motion.div>
          ) : uploading ? (
            <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center gap-3">
                <Spinner />
                <div>
                  <div className="text-sm font-semibold text-white">Preparing…</div>
                  <div className="mt-1 text-xs text-white/55">Indexing content for retrieval. Almost there.</div>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                />
              </div>
              <div className="flex justify-between text-[11px] text-white/40">
                <span>{pct}% complete</span>
                <span>Secure upload</span>
              </div>
            </motion.div>
          ) : file ? (
            <motion.div key="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
              <div className="truncate text-sm font-semibold text-white/90">{file.name}</div>
              <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                <span>{formatBytes(file.size)}</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">Tap to replace</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-sm text-white/75">
                <span className="font-semibold text-white">Drop</span> a PDF anywhere in this panel
              </div>
              <div className="mt-2 text-xs text-white/45">Prefer text-based PDFs for best comprehension.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={disabled} />
    </motion.div>
  );
}
