import { Bot, Paperclip, Send, User } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Spinner } from "./Spinner";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function SkeletonLines() {
  return (
    <div className="mt-3 space-y-2">
      {[0.85, 0.65, 0.45].map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.12 }}
          className="h-2.5 rounded-full bg-white/10"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}

export function Chat({
  ready,
  busy,
  uploading,
  messages,
  input,
  draftPreview,
  onInputChange,
  onSend,
}: {
  ready: boolean;
  busy: boolean;
  uploading: boolean;
  messages: ChatMessage[];
  input: string;
  /** Debounced draft for subtle UI hints (performance / polish). */
  draftPreview: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  const blocked = !ready || busy || uploading;
  const canSend = ready && input.trim().length > 0 && !busy && !uploading;

  return (
    <div className="glass glow-panel flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl shadow-glow-soft lg:min-h-[calc(100vh-10rem)]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold tracking-tight">Chat</div>
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-white/50">
              {!ready ? "Upload a document to unlock questions." : "Answers use your document as the source — ask naturally."}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className={["h-2 w-2 rounded-full", busy ? "bg-cyan-300 animate-pulse" : ready ? "bg-emerald-400" : "bg-amber-400"].join(" ")} />
            <span className="text-[11px] font-medium text-white/70">{busy ? "Assistant is responding…" : ready ? "Ready" : "Awaiting PDF"}</span>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-5 overflow-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="text-sm font-semibold text-white/90">Start a conversation</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Your assistant reads the passages it retrieves from your uploaded document. Ask summaries, lookups, clauses, timelines — whatever helps you ship faster.
            </p>
            {draftPreview.trim().length > 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] text-white/45">
                <span className="font-semibold text-white/60">Typing preview:</span> {draftPreview.length > 120 ? `${draftPreview.slice(0, 120)}…` : draftPreview}
              </div>
            ) : null}
          </motion.div>
        ) : null}

        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, x: isUser ? 26 : -26, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className={["flex items-end gap-3", isUser ? "justify-end" : "justify-start"].join(" ")}
              >
                {!isUser ? (
                  <div className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/15 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                    <Bot className="h-5 w-5 text-white/90" />
                  </div>
                ) : null}

                <div className={`max-w-[88%] sm:max-w-[72%]`}>
                  <div
                    className={[
                      "rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-black/40",
                      isUser
                        ? "border-white/15 bg-gradient-to-b from-violet-500/30 to-indigo-500/15 shadow-lg"
                        : "border-white/10 bg-black/30 shadow-lg",
                    ].join(" ")}
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">{isUser ? "You" : "Assistant"}</div>
                    <div className="whitespace-pre-wrap text-white/[0.92]">{m.content}</div>
                  </div>
                </div>

                {isUser ? (
                  <div className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-inner">
                    <User className="h-5 w-5 text-white/90" />
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {busy ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex items-end gap-3"
            >
              <div className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/15">
                <Bot className="h-5 w-5 text-white/90" />
              </div>
              <div className="max-w-[88%] sm:max-w-[72%] rounded-3xl border border-white/10 bg-black/30 px-4 py-4 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-medium text-white/70">AI is thinking...</div>
                  <Spinner />
                </div>
                <SkeletonLines />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 bg-black/25 px-4 py-4 sm:px-5">
        <div className="flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              className="input min-h-[54px] max-h-44 resize-none pr-12 placeholder:text-white/35"
              placeholder={ready ? "Ask anything grounded in your document…" : "Upload a PDF to begin…"}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) onSend();
                }
              }}
              disabled={blocked}
            />
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/10 bg-black/35 p-1.5 opacity-55">
              <Paperclip className="h-3.5 w-3.5" />
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: canSend ? 1.04 : 1 }}
            whileTap={{ scale: canSend ? 0.98 : 1 }}
            disabled={!canSend}
            onClick={onSend}
            className="btn btnPrimary inline-flex !h-[54px] !min-w-[54px] items-center justify-center rounded-2xl px-5 shadow-[0_0_24px_rgba(139,92,246,0.35)]"
          >
            {busy ? <Spinner compact /> : <Send className="h-4 w-4" />}
          </motion.button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/40">
          <span>
            <span className="text-white/60">Enter</span> sends ·{" "}
            <span className="text-white/60">Shift+Enter</span> newline
          </span>
          {uploading ? <span className="font-medium text-amber-200/85">Indexing in progress…</span> : null}
        </div>
      </div>
    </div>
  );
}
