import { cn } from "@/lib/utils";
import type { ConfidenceBand } from "@/lib/pipeline/models";

const CONFIG: Record<ConfidenceBand, { label: string; className: string }> = {
  HIGH: {
    label: "High",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  REVIEW: {
    label: "Review",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
  SINGLE: {
    label: "Single",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
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
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
