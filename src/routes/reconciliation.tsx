import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadges } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";
import type { ConfidenceBand, ReconciledSite } from "@/lib/pipeline/models";

export const Route = createFileRoute("/reconciliation")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "Reconciliation — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "How the WLCG reconciliation engine matches catalogue records, assigns confidence scores, and reports conflicts.",
      },
      { property: "og:title", content: "Reconciliation — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "How the WLCG reconciliation engine matches catalogue records, assigns confidence scores, and reports conflicts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReconciliationPage,
});

function ReconciliationPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);
  const [filter, setFilter] = useState<ConfidenceBand | "all">("all");

  const matched = useMemo(
    () => snapshot.sites.filter((s) => s.providers.length >= 2),
    [snapshot.sites],
  );
  const shown = useMemo(
    () =>
      filter === "all" ? matched : matched.filter((s) => s.confidence === filter),
    [matched, filter],
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">Reconciliation engine</p>
        <h1 className="font-display text-4xl font-black">
          How matches are{" "}
          <em className="font-normal italic text-accent">decided</em>
        </h1>
        <p className="max-w-2xl text-sm text-ink-soft">
          {matched.length} centres appear in more than one catalogue. Each match
          gets a score from shared evidence, then a confidence band. Disagreements
          are shown, not hidden.
        </p>
      </header>

      <div className="flex flex-wrap gap-1">
        {(["all", "HIGH", "MEDIUM", "REVIEW"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            className={cn(
              "border px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-colors",
              filter === b
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {b === "all" ? "All matches" : b}
          </button>
        ))}
        <InfoTip term="confidence" className="ml-1" />
      </div>

      <div className="grid gap-4">
        {shown.map((site) => (
          <SiteReconciliationCard key={site.canonical_id} site={site} />
        ))}
      </div>
    </div>
  );
}

function SiteReconciliationCard({ site }: { site: ReconciledSite }) {
  return (
    <div className="border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold">{site.name}</h3>
          <p className="font-mono text-[10.5px] text-muted-foreground">
            {site.canonical_id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProviderBadges providers={site.providers} />
          <ConfidenceBadge band={site.confidence} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {site.evidence.length > 0 ? (
          site.evidence.map((ev, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border border-rule bg-secondary/30 p-3"
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] font-bold",
                  ev.points > 0
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                {ev.points > 0 ? "+" : ""}
                {ev.points}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-semibold">{ev.signal}</div>
                <div className="text-muted-foreground">{ev.detail}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            Single-source centre; no cross-provider evidence.
          </p>
        )}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-muted-foreground">Total confidence</span>
          <span className="font-display text-2xl font-black tabular-nums">
            {site.score}
          </span>
        </div>
      </div>

      {site.conflicts.length > 0 ? (
        <div className="mt-4 space-y-2">
          <div className="label-micro">Disagreements</div>
          <div className="flex flex-wrap gap-2">
            {site.conflicts.map((c, i) => (
              <span
                key={i}
                className="border border-destructive/30 px-1.5 py-0.5 text-[10px] text-destructive"
              >
                {c.field}: {c.values.map((v) => `${v.provider}=${v.value}`).join(" vs ")}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <Link
        to="/sites/$id"
        params={{ id: site.canonical_id.replace("site:", "") }}
        className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent hover:underline"
      >
        Inspect centre <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
