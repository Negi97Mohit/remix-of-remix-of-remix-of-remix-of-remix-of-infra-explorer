import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Network,
  GitMerge,
  ShieldAlert,
  FileJson,
  CheckCircle2,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import { siteQueryOptions } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadge, ProviderBadges } from "@/components/provider-badge";
import { QualityList } from "@/components/quality-list";
import { InfoTip } from "@/components/info-tip";
import { ScoringGuide } from "@/components/scoring-guide";
import { cn } from "@/lib/utils";
import type { ProviderId, ProviderRecord } from "@/lib/pipeline/models";

export const Route = createFileRoute("/sites/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      siteQueryOptions(
        params.id.startsWith("site:") ? params.id : `site:${params.id}`,
      ),
    ),
  head: ({ params }) => ({
    meta: [
      {
        title: `Centre ${params.id} — WLCG Infrastructure Explorer`,
      },
      {
        name: "description",
        content: `Reconciled centre ${params.id}: side-by-side catalogue records, provenance tracing, and conflict visualization.`,
      },
      { property: "og:title", content: `Centre ${params.id} — WLCG Infrastructure Explorer` },
      {
        property: "og:description",
        content: `Reconciled centre ${params.id}: side-by-side catalogue records, provenance tracing, and conflict visualization.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SiteDetailPage,
});

const PROVIDER_STROKE: Record<ProviderId, string> = {
  gocdb: "border-t-foreground",
  bdii: "border-t-accent",
  osg: "border-t-foreground/70",
};

function SiteDetailPage() {
  const { id } = Route.useParams();
  const canonicalId = id.startsWith("site:") ? id : `site:${id}`;
  const { data: site } = useSuspenseQuery(siteQueryOptions(canonicalId));

  if (!site) {
    return (
      <div className="space-y-4">
        <Link
          to="/sites"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to centres
        </Link>
        <p className="text-muted-foreground">Centre not found.</p>
      </div>
    );
  }

  const [showTrace, setShowTrace] = useState(true);
  const [activeProvider, setActiveProvider] = useState<ProviderId | "all">(
    "all",
  );

  const visibleRecords = useMemo(
    () =>
      activeProvider === "all"
        ? site.records
        : site.records.filter((r) => r.provider === activeProvider),
    [site.records, activeProvider],
  );

  return (
    <div className="space-y-10">
      <Link
        to="/sites"
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All centres
      </Link>

      <header className="space-y-3 border-b border-rule pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-black sm:text-5xl">
            {site.name}
          </h1>
          <ConfidenceBadge band={site.confidence} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="font-mono">{site.canonical_id}</span>
          {site.country ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {site.country}
              {site.country_code ? ` (${site.country_code})` : null}
            </span>
          ) : null}
          {site.latitude !== undefined && site.longitude !== undefined ? (
            <span className="font-mono">
              {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
              {site.coordinate_precision !== "exact" ? " (approx.)" : null}
            </span>
          ) : null}
          <span>{site.service_count} services</span>
          <span className="font-mono">score {site.score}</span>
        </div>
        <ProviderBadges providers={site.providers} />
      </header>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Network className="h-5 w-5" /> Canonical fields{" "}
          <InfoTip term="canonical" />
        </h2>
        <p className="max-w-2xl text-sm text-ink-soft">
          These are the values chosen for the unified centre. Each value remembers
          which catalogue it came from.
        </p>
        <div className="grid gap-px bg-border md:grid-cols-2">
          {site.fields.map((f) => (
            <div key={f.field} className="bg-paper p-4">
              <div className="flex items-center justify-between">
                <span className="label-micro">{f.field}</span>
                {f.selected_from ? (
                  <ProviderBadge provider={f.selected_from} showShort />
                ) : null}
              </div>
              <p className="mt-1 break-words font-mono text-sm">
                {f.value !== null ? String(f.value) : "—"}
              </p>
              {f.provenance.length > 1 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.provenance.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 border border-rule px-1.5 py-0.5 text-[10px]"
                      title={`${p.source_field} = ${p.value}`}
                    >
                      <ProviderBadge provider={p.provider} showShort />
                      <span className="font-mono text-muted-foreground">
                        {p.value}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Workflow className="h-5 w-5" /> Trace this match{" "}
            <InfoTip term="evidence" />
          </h2>
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="border border-rule px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] hover:bg-secondary"
          >
            {showTrace ? "Hide" : "Show"} evidence
          </button>
        </div>
        {showTrace ? (
          <div className="space-y-3">
            {site.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cross-provider evidence — this is a single-source centre.
              </p>
            ) : (
              <>
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-muted-foreground">Total score</span>
                  <span className="font-display text-3xl font-black tabular-nums">
                    {site.score}
                  </span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {site.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 border border-rule bg-paper p-4"
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold",
                          ev.points > 0
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-destructive/40 bg-destructive/10 text-destructive",
                        )}
                      >
                        {ev.points > 0 ? "+" : ""}
                        {ev.points}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{ev.signal}</div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ev.detail}
                        </p>
                        <div className="mt-1.5 flex gap-1">
                          {ev.providers.map((p) => (
                            <ProviderBadge key={p} provider={p} showShort />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      {site.conflicts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <ShieldAlert className="h-5 w-5" /> Field disagreements{" "}
            <InfoTip term="conflict" />
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {site.conflicts.map((c, i) => (
              <div key={i} className="border border-destructive/30 bg-paper p-4">
                <div className="flex items-center justify-between">
                  <span className="label-micro">{c.field}</span>
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
                <div className="mt-2 space-y-1">
                  {c.values.map((v, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <ProviderBadge provider={v.provider} showShort />
                      <span className="font-mono">{v.value}</span>
                    </div>
                  ))}
                </div>
                {c.resolution ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mr-1 inline h-3 w-3 text-accent" />
                    {c.resolution}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <GitMerge className="h-5 w-5" /> Field-by-field comparison{" "}
          <InfoTip term="provider" />
        </h2>
        <p className="max-w-2xl text-sm text-ink-soft">
          Each row is one field. Each column is one catalogue. Values that agree
          across catalogues are highlighted; differences are shown so they can be
          judged.
        </p>
        <ComparisonMatrix records={site.records} providers={site.providers} />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          How the score was reached <InfoTip term="confidence" />
        </h2>
        <ScoringGuide compact />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <GitMerge className="h-5 w-5" /> Raw catalogue records{" "}
            <InfoTip term="provider" />
          </h2>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveProvider("all")}
              className={cn(
                "border px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
                activeProvider === "all"
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            {site.providers.map((p) => (
              <button
                key={p}
                onClick={() => setActiveProvider(p)}
                className={cn(
                  "border px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
                  activeProvider === p
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <ProviderBadge provider={p} showShort />
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecords.map((rec, i) => (
            <ProviderRecordCard key={i} record={rec} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <ShieldAlert className="h-5 w-5" /> Data quality
        </h2>
        <QualityList findings={site.quality} />
      </section>

      <div className="flex justify-end">
        <Link
          to="/reconciliation"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent hover:underline"
        >
          See all reconciliations <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function ProviderRecordCard({ record }: { record: ProviderRecord }) {
  return (
    <div
      className={cn(
        "border-t-[3px] border-x border-b border-rule bg-paper p-4",
        PROVIDER_STROKE[record.provider],
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <ProviderBadge provider={record.provider} />
        <span className="text-[10px] font-mono text-muted-foreground">
          {record.source_id}
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        <FieldRow label="Name" value={record.name} mono />
        {record.description ? (
          <FieldRow label="Description" value={record.description} />
        ) : null}
        {record.country ? <FieldRow label="Country" value={record.country} /> : null}
        {record.country_code ? (
          <FieldRow label="ISO" value={record.country_code} mono />
        ) : null}
        {record.latitude !== undefined ? (
          <FieldRow label="Lat" value={record.latitude.toFixed(4)} mono />
        ) : null}
        {record.longitude !== undefined ? (
          <FieldRow label="Lon" value={record.longitude.toFixed(4)} mono />
        ) : null}
        <FieldRow label="Coords" value={record.coordinate_precision} mono />
        {record.endpoints.map((ep, i) => (
          <FieldRow key={i} label={i === 0 ? "Endpoint" : ""} value={ep} mono />
        ))}
        {record.services.map((svc, i) => (
          <div key={i} className="border-t border-rule pt-1.5">
            <FieldRow label="Service" value={svc.name} mono />
            {svc.type ? <FieldRow label="Type" value={svc.type} /> : null}
            {svc.implementation ? (
              <FieldRow label="Impl" value={svc.implementation} mono />
            ) : null}
          </div>
        ))}
      </div>
      <details className="mt-3">
        <summary className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
          <FileJson className="h-3 w-3" /> Raw fields
        </summary>
        <pre className="mt-2 overflow-x-auto border border-rule bg-secondary/30 p-2 text-[10px] font-mono leading-relaxed">
          {JSON.stringify(record.raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function FieldRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {label ? (
        <span className="w-16 shrink-0 font-mono text-[9.5px] uppercase text-muted-foreground">
          {label}
        </span>
      ) : null}
      <span className={cn("min-w-0 break-words", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
