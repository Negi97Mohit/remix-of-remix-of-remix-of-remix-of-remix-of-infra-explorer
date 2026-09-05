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

export function ConfidenceBadge({
  band,
  className,
}: {
  band: ConfidenceBand;
  className?: string;
}) {
  const config = CONFIG[band];
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
