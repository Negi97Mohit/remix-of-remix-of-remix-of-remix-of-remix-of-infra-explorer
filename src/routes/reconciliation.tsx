import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GitMerge, ArrowRight } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadges } from "@/components/provider-badge";
import { Badge } from "@/components/ui/badge";
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
          "How the WLCG reconciliation engine matches provider records, assigns confidence scores, and reports conflicts.",
      },
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
    () => (filter === "all" ? matched : matched.filter((s) => s.confidence === filter)),
    [matched, filter],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Reconciliation Engine</h1>
        <p className="text-sm text-muted-foreground">
          {matched.length} multi-provider matches out of {snapshot.sites.length} sites.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "HIGH", "MEDIUM", "REVIEW"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === b
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50",
            )}
          >
            {b === "all" ? "All matches" : b}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {shown.map((site) => (
          <SiteReconciliationCard key={site.canonical_id} site={site} />
        ))}
      </div>
    </div>
  );
}

function SiteReconciliationCard({ site }: { site: ReconciledSite }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{site.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{site.canonical_id}</p>
          </div>
          <div className="flex items-center gap-2">
            <ProviderBadges providers={site.providers} />
            <ConfidenceBadge band={site.confidence} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {site.evidence.length > 0 ? (
          <div className="space-y-2">
            {site.evidence.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-border/60 p-2"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    ev.points > 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400",
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
            ))}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-muted-foreground">Total confidence:</span>
              <span className="font-mono text-foreground">{site.score}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Single-source site; no cross-provider evidence.</p>
        )}

        {site.conflicts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conflicts
            </div>
            <div className="flex flex-wrap gap-2">
              {site.conflicts.map((c, i) => (
                <Badge
                  key={i}
                  variant={c.status === "unresolved" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {c.field}: {c.values.map((v) => `${v.provider}=${v.value}`).join(" vs ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/sites/$id"
          params={{ id: site.canonical_id.replace("site:", "") }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Inspect site <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
