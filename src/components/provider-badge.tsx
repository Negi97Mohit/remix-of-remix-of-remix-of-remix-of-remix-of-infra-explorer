import { cn } from "@/lib/utils";
import type { ProviderId } from "@/lib/pipeline/models";

const CONFIG: Record<
  ProviderId,
  { label: string; short: string; className: string }
> = {
  gocdb: {
    label: "GOCDB",
    short: "G",
    className: "border-foreground/10 bg-secondary text-foreground",
  },
  bdii: {
    label: "BDII",
    short: "B",
    className: "border-accent/40 bg-accent/10 text-accent",
  },
  osg: {
    label: "OSG",
    short: "O",
    className: "border-foreground/10 bg-foreground text-background",
  },
};

export function ProviderBadge({
  provider,
  className,
  showShort = false,
}: {
  provider: ProviderId | string;
  className?: string;
  showShort?: boolean;
}) {
  const key = (provider || "").toLowerCase() as ProviderId;
  const config = CONFIG[key] || {
    label: (provider || "UNKNOWN").toUpperCase(),
    short: (provider || "?")[0]?.toUpperCase(),
    className: "border-border bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] rounded-xs",
        config.className,
        className,
      )}
    >
      {showShort ? config.short : config.label}
    </span>
  );
}

export function ProviderBadges({
  providers,
  className,
}: {
  providers: (ProviderId | string)[];
  className?: string;
}) {
  if (!providers || providers.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {providers.map((p, idx) => (
        <ProviderBadge key={`${p}-${idx}`} provider={p} />
      ))}
    </div>
  );
}
