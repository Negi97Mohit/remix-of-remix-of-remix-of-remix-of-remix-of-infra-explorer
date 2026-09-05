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
  provider: ProviderId;
  className?: string;
  showShort?: boolean;
}) {
  const config = CONFIG[provider];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em]",
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
  providers: ProviderId[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {providers.map((p) => (
        <ProviderBadge key={p} provider={p} />
      ))}
    </div>
  );
}
