export function Spinner({ label, compact }: { label?: string; compact?: boolean }) {
  const box = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? "text-xs text-white/70" : "text-sm text-white/70"}`}>
      <span className={`relative inline-flex ${box}`}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20" />
        <span className={`relative inline-flex ${box} rounded-full bg-white/40`} />
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}
