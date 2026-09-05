import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadge } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import type { ConfidenceBand, ProviderHealth } from "@/lib/pipeline/models";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "WLCG Infrastructure Explorer — One list from three catalogues" },
      {
        name: "description",
        content:
          "Live view of grid computing centres unified across GOCDB, BDII and OSG: coverage, match confidence, source health and disagreements.",
      },
      {
        property: "og:title",
        content: "WLCG Infrastructure Explorer — One list from three catalogues",
      },
      {
        property: "og:description",
        content:
          "Live view of grid computing centres unified across GOCDB, BDII and OSG: coverage, match confidence, source health and disagreements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);

  const sites = snapshot.sites;
  const matched = sites.filter((s) => s.providers.length >= 2);
  const single = sites.filter((s) => s.providers.length === 1);
  const countries = new Set(sites.map((s) => s.country_code).filter(Boolean))
    .size;
  const conflicts = sites.flatMap((s) => s.conflicts);

  const bandCounts = sites.reduce(
    (acc, s) => {
      acc[s.confidence] = (acc[s.confidence] ?? 0) + 1;
      return acc;
    },
    {} as Record<ConfidenceBand, number>,
  );

  const stats = [
    {
      label: "Centres",
      value: sites.length,
      note: "unified entries",
      term: "canonical",
    },
    {
      label: "Source records",
      value: snapshot.records.length,
      note: "across catalogues",
      term: "provider",
    },
    {
      label: "Unified",
      value: matched.length,
      note: "in 2+ catalogues",
      term: "reconciliation",
    },
    {
      label: "Single source",
      value: single.length,
      note: "only 1 catalogue",
      term: "site",
    },
    {
      label: "Countries",
      value: countries,
      note: "represented",
      term: "coordinates",
    },
    {
      label: "Disagreements",
      value: conflicts.length,
      note: "fields to judge",
      term: "conflict",
    },
  ];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 border-b border-rule pb-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="space-y-4">
          <p className="label-micro">
            Retrieved {new Date(snapshot.built_at).toUTCString()} · built in{" "}
            {snapshot.duration_ms} ms
          </p>
          <h1 className="font-display text-4xl font-black leading-[1.03] sm:text-6xl">
            One list of the world&apos;s
            <br />
            <em className="font-normal italic text-accent">
              scientific computing centres
            </em>
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Three regional catalogues describe the same centres in different
            words. This explorer reads them live, works out which entries are the
            same place, and shows the reasoning openly — so a single trustworthy
            list can be checked rather than assumed.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-background hover:opacity-80"
            >
              Explore the map <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 border border-rule px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] hover:bg-foreground hover:text-background"
            >
              Read the guide
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper p-4">
              <p className="flex items-center gap-1 label-micro">
                {s.label} <InfoTip term={s.term} />
              </p>
              <p className="mt-1 font-display text-3xl font-black tabular-nums">
                {s.value}
              </p>
              <p className="text-[10.5px] text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            Where the data comes from{" "}
            <InfoTip term="provider" />
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {snapshot.providers.map((p) => (
              <ProviderHealthRow key={p.provider} health={p} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            How sure are the matches <InfoTip term="confidence" />
          </h2>
          <div className="space-y-3">
            {(["HIGH", "MEDIUM", "REVIEW", "SINGLE"] as ConfidenceBand[]).map(
              (band) => {
                const count = bandCounts[band] ?? 0;
                const pct = sites.length ? (count / sites.length) * 100 : 0;
                return (
                  <div key={band} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <ConfidenceBadge band={band} />
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {count} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-border">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {conflicts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            Where catalogues disagree <InfoTip term="conflict" />
          </h2>
          <div className="grid gap-px bg-border md:grid-cols-2">
            {conflicts.slice(0, 6).map((c, i) => (
              <Link
                key={i}
                to="/reconciliation"
                className="group bg-paper p-4 hover:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                    {c.field}
                  </span>
                  <span
                    className={cn(
                      "text-[9.5px] font-semibold uppercase tracking-[0.14em]",
                      c.status === "unresolved"
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.status.replace(/-/g, " ")}
                  </span>
                </div>
                <div className="mt-2 space-y-0.5">
                  {c.values.map((v, j) => (
                    <p key={j} className="text-[11.5px] text-ink-soft">
                      <span className="text-muted-foreground">
                        {v.provider.toUpperCase()}:
                      </span>{" "}
                      {v.value}
                    </p>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProviderHealthRow({ health }: { health: ProviderHealth }) {
  const dot = {
    healthy: "bg-accent",
    degraded: "bg-amber-600",
    error: "bg-destructive",
  }[health.status];

  return (
    <div className="flex items-start gap-3 py-4">
      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <ProviderBadge provider={health.provider} />
          <span className="text-sm font-medium">{health.label}</span>
          <InfoTip term={health.provider} />
          <span className="ml-auto text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {health.mode === "live" ? "Live" : "Snapshot"}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{health.record_count} records</span>
          {health.latency_ms !== null ? (
            <span className="tabular-nums">{health.latency_ms} ms</span>
          ) : null}
          {health.last_retrieved ? (
            <span className="font-mono">
              {new Date(health.last_retrieved).toISOString().slice(0, 16)}Z
            </span>
          ) : null}
        </p>
        {health.note ? (
          <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
            {health.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
