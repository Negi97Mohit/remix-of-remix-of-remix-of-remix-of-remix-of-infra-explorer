import { cn } from "@/lib/utils";
import type { ProviderId } from "@/lib/pipeline/models";

const CONFIG: Record<
  ProviderId,
  { label: string; short: string; className: string }
> = {
  gocdb: {
    label: "GOCDB",
    short: "G",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  bdii: {
    label: "BDII",
    short: "B",
    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  osg: {
    label: "OSG",
    short: "O",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-300",
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
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold",
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
