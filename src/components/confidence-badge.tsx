import { cn } from "@/lib/utils";
import type { ConfidenceBand } from "@/lib/pipeline/models";

const CONFIG: Record<ConfidenceBand, { label: string; className: string }> = {
  HIGH: {
    label: "High",
    className: "border-foreground/10 bg-foreground text-background",
  },
  MEDIUM: {
    label: "Medium",
    className: "border-accent/40 bg-accent/10 text-accent",
  },
  REVIEW: {
    label: "Review",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  SINGLE: {
    label: "Single",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const DEFAULT_CONFIG = CONFIG.SINGLE;

export function ConfidenceBadge({
  band,
  confidence,
  score,
  className,
}: {
  band?: ConfidenceBand | string;
  confidence?: ConfidenceBand | string;
  score?: number;
  className?: string;
}) {
  const rawKey = (band || confidence || "SINGLE").toString().toUpperCase() as ConfidenceBand;
  const config = CONFIG[rawKey] || DEFAULT_CONFIG;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] rounded-xs",
        config.className,
        className,
      )}
    >
      <span>{config.label}</span>
      {score !== undefined && score > 0 && (
        <span className="font-mono text-[9px] opacity-80">· {score}</span>
      )}
    </span>
  );
}
