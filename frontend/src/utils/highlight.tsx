import React from "react";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Lightweight highlight: emphasizes words from the user's question inside a passage preview.
 */
export function highlightFromQuery(text: string, query: string, maxTerms = 6): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const termSet = new Set(
    trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, maxTerms),
  );
  const termList = [...termSet].map(escapeRegex);
  if (!termList.length) return text;

  const splitter = new RegExp(`(${termList.join("|")})`, "gi");
  const parts = text.split(splitter);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const hit = termSet.has(part.toLowerCase());
        return hit ? (
          <mark key={i} className="rounded-md bg-emerald-400/25 px-0.5 text-emerald-100">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
