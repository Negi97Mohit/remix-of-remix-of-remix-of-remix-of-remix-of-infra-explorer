import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Globe2,
  Database,
  GitMerge,
  Layers,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadge } from "@/components/provider-badge";
import type { ConfidenceBand, ProviderHealth } from "@/lib/pipeline/models";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "Dashboard — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Overview of reconciled WLCG infrastructure: provider health, confidence distribution, coverage and conflicts.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);

  const sites = snapshot.sites;
  const matched = sites.filter((s) => s.providers.length >= 2);
  const single = sites.filter((s) => s.providers.length === 1);
  const countries = new Set(
    sites.map((s) => s.country_code).filter(Boolean),
  ).size;
  const conflicts = sites.flatMap((s) => s.conflicts);
  const totalRecords = snapshot.records.length;

  const bandCounts = sites.reduce(
    (acc, s) => {
      acc[s.confidence] = (acc[s.confidence] ?? 0) + 1;
      return acc;
    },
    {} as Record<ConfidenceBand, number>,
  );

  const kpis = [
    {
      label: "Reconciled Sites",
      value: sites.length,
      icon: Database,
      sub: `${matched.length} matched · ${single.length} single-source`,
    },
    {
      label: "Source Records",
      value: totalRecords,
      icon: Layers,
      sub: "across all providers",
    },
    {
      label: "Countries Covered",
      value: countries,
      icon: Globe2,
      sub: "by ISO code",
    },
    {
      label: "Field Conflicts",
      value: conflicts.length,
      icon: AlertTriangle,
      sub: "across matched sites",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Infrastructure Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live reconciliation of heterogeneous grid metadata. Built at{" "}
          <span className="font-mono text-foreground">
            {new Date(snapshot.built_at).toISOString()}
          </span>{" "}
          in {snapshot.duration_ms} ms.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="gap-0">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold tabular-nums">{kpi.value}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Provider Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" /> Provider Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.providers.map((p) => (
              <ProviderHealthRow key={p.provider} health={p} />
            ))}
          </CardContent>
        </Card>

        {/* Confidence distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Confidence Bands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["HIGH", "MEDIUM", "REVIEW", "SINGLE"] as ConfidenceBand[]).map(
              (band) => {
                const count = bandCounts[band] ?? 0;
                const pct = sites.length ? (count / sites.length) * 100 : 0;
                return (
                  <div key={band} className="flex items-center gap-3">
                    <ConfidenceBadge band={band} className="w-16 justify-center" />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold tabular-nums">
                          {count}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" /> Field Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {conflicts.slice(0, 8).map((c, i) => (
                <Link
                  key={i}
                  to="/reconciliation"
                  className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {c.field}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        c.status === "unresolved" ? "text-rose-400" : "text-emerald-400",
                      )}
                    >
                      {c.status.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.values.map((v, j) => (
                      <span
                        key={j}
                        className="flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px]"
                      >
                        <ProviderBadge provider={v.provider} showShort />
                        <span className="font-mono">{v.value}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/map" as const, label: "World Map", desc: "Geographic view of all sites" },
          { to: "/sites" as const, label: "Site Explorer", desc: "Search & filter sites" },
          { to: "/reconciliation" as const, label: "Reconciliation", desc: "Evidence & conflicts" },
          { to: "/data-flow" as const, label: "Data Flow", desc: "Pipeline stages" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-lg border border-border/60 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50"
          >
            <div className="text-sm font-semibold">{link.label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProviderHealthRow({ health }: { health: ProviderHealth }) {
  const statusColor = {
    healthy: "text-emerald-400",
    degraded: "text-amber-400",
    error: "text-rose-400",
  }[health.status];

  const dotClass = {
    healthy: "bg-emerald-400",
    degraded: "bg-amber-400",
    error: "bg-rose-400",
  }[health.status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
      <div className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ProviderBadge provider={health.provider} />
          <span className="truncate text-xs text-muted-foreground">
            {health.label} · {health.protocol}
          </span>
          <span className={cn("text-[10px] font-semibold uppercase", statusColor)}>
            {health.status}
          </span>
          <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground">
            {health.mode}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{health.record_count} records</span>
          {health.latency_ms !== null && (
            <span className="flex items-center gap-0.5 tabular-nums">
              <Clock className="h-3 w-3" /> {health.latency_ms} ms
            </span>
          )}
          {health.last_retrieved && (
            <span className="font-mono">
              {new Date(health.last_retrieved).toISOString().slice(0, 16)}Z
            </span>
          )}
        </div>
        {health.note && (
          <p className="mt-1 text-[10px] text-muted-foreground/80">{health.note}</p>
        )}
      </div>
    </div>
  );
}
