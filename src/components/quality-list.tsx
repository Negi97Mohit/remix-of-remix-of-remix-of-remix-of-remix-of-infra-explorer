import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualityFinding } from "@/lib/pipeline/models";

const ICON = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const CLASS = {
  info: "text-sky-400",
  warning: "text-amber-400",
  error: "text-rose-400",
} as const;

export function QualityList({
  findings,
  className,
}: {
  findings: QualityFinding[];
  className?: string;
}) {
  if (findings.length === 0) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        No quality findings.
      </p>
    );
  }
  return (
    <ul className={cn("space-y-1.5", className)}>
      {findings.map((f, i) => {
        const Icon = ICON[f.level];
        return (
          <li key={i} className="flex items-start gap-2 text-xs">
            <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", CLASS[f.level])} />
            <span>
              <span className="font-mono font-semibold text-foreground">
                {f.field}
              </span>
              <span className="text-muted-foreground"> — {f.message}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
