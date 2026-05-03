import { ChevronDown, Sparkles } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { SourceChunk } from "../types";
import { highlightFromQuery } from "../utils/highlight";

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** Map inner-product similarity (−1..1 for unit-normalized cosine) into a readable percent. */
function relevancePercent(score: number): number {
  const v = ((score + 1) / 2) * 100;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function SourcesPanel({
  sources,
  highlightQuery,
  debouncedTypingQuery,
}: {
  sources: SourceChunk[];
  highlightQuery: string;
  debouncedTypingQuery?: string;
}) {
  const [open, setOpen] = React.useState(true);

  const queryForHl = highlightQuery.trim() ? highlightQuery.trim() : (debouncedTypingQuery?.trim() ?? "");

  return (
    <motion.div layout className="glass glow-panel overflow-hidden rounded-3xl shadow-glow-soft">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-200/85" />
          <div className="text-sm font-semibold text-white/95">Supporting passages</div>
          <div className="hidden text-xs text-white/45 sm:inline">Retrieved references</div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-white/60" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="sources"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="border-t border-white/10"
          >
            <div className="custom-scroll max-h-96 overflow-y-auto px-4 py-4">
              {sources.length === 0 ? (
                <div className="text-sm leading-relaxed text-white/55">Ask something to reveal the excerpts we used underneath each answer.</div>
              ) : (
                <div className="space-y-3">
                  {sources.map((s, idx) => {
                    const pct = relevancePercent(s.score);
                    const preview = truncate(s.text, 520);
                    return (
                      <motion.div
                        key={s.chunk_id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28 }}
                        className="rounded-3xl border border-white/12 bg-black/25 p-4 shadow-inner hover:border-white/18 transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Passage {idx + 1}</div>
                          <span className="rounded-full border border-white/14 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100/90">
                            Relevance {pct}%
                          </span>
                        </div>
                        <div className="mt-3 text-sm leading-relaxed text-white/[0.86]">{highlightFromQuery(preview, queryForHl)}</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
