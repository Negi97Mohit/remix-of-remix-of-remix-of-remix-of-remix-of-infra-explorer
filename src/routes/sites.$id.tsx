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
} from "lucide-react";
import { siteQueryOptions } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadge, ProviderBadges } from "@/components/provider-badge";
import { QualityList } from "@/components/quality-list";
import { cn } from "@/lib/utils";
import type { ProviderId, ProviderRecord } from "@/lib/pipeline/models";

export const Route = createFileRoute("/sites/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(siteQueryOptions(params.id.startsWith("site:") ? params.id : `site:${params.id}`)),
  head: ({ params }) => ({
    meta: [
      { title: `Site ${params.id} — WLCG Infrastructure Explorer` },
      {
        name: "description",
        content: `Reconciled site ${params.id}: side-by-side provider records, provenance tracing, and conflict visualization.`,
      },
    ],
  }),
  component: SiteDetailPage,
});

const PROVIDER_COLORS: Record<ProviderId, string> = {
  gocdb: "border-violet-500/30",
  bdii: "border-cyan-500/30",
  osg: "border-orange-500/30",
};

function SiteDetailPage() {
  const { id } = Route.useParams();
  const canonicalId = id.startsWith("site:") ? id : `site:${id}`;
  const { data: site } = useSuspenseQuery(siteQueryOptions(canonicalId));

  if (!site) {
    return (
      <div className="space-y-4">
        <Link to="/sites/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sites
        </Link>
        <p className="text-muted-foreground">Site not found.</p>
      </div>
    );
  }

  const [showTrace, setShowTrace] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId | "all">("all");

  const visibleRecords = useMemo(
    () =>
      activeProvider === "all"
        ? site.records
        : site.records.filter((r) => r.provider === activeProvider),
    [site.records, activeProvider],
  );

  return (
    <div className="space-y-5">
      <Link to="/sites/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sites
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
          <ConfidenceBadge band={site.confidence} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{site.canonical_id}</span>
          {site.country && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {site.country}
              {site.country_code && ` (${site.country_code})`}
            </span>
          )}
          {site.latitude !== undefined && site.longitude !== undefined && (
            <span className="font-mono">
              {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
              {site.coordinate_precision !== "exact" && " (approx.)"}
            </span>
          )}
          <span>{site.service_count} services</span>
          <span className="font-mono">score: {site.score}</span>
        </div>
        <ProviderBadges providers={site.providers} className="mt-1" />
      </div>

      {/* Canonical fields with provenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4" /> Canonical Fields & Provenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {site.fields.map((f) => (
              <div
                key={f.field}
                className="rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                    {f.field}
                  </span>
                  {f.selected_from && (
                    <ProviderBadge provider={f.selected_from} showShort />
                  )}
                </div>
                <div className="mt-1 font-mono text-sm text-foreground break-all">
                  {f.value !== null ? String(f.value) : "—"}
                </div>
                {f.provenance.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {f.provenance.map((p, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px]"
                        title={`${p.source_field} = ${p.value}`}
                      >
                        <ProviderBadge provider={p.provider} showShort />
                        <span className="font-mono text-muted-foreground">{p.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trace This Match */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="h-4 w-4" /> Trace This Match
            </CardTitle>
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {showTrace ? "Hide" : "Show evidence"}
            </button>
          </div>
        </CardHeader>
        {showTrace && (
          <CardContent className="space-y-3">
            {site.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cross-provider evidence — this is a single-source site.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total score:</span>
                  <span className="font-mono text-lg font-bold">{site.score}</span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                {site.evidence.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        ev.points > 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400",
                      )}
                    >
                      {ev.points > 0 ? "+" : ""}
                      {ev.points}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{ev.signal}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ev.detail}</p>
                      <div className="mt-1.5 flex gap-1">
                        {ev.providers.map((p) => (
                          <ProviderBadge key={p} provider={p} showShort />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Conflicts */}
      {site.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4" /> Field Conflicts ({site.conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {site.conflicts.map((c, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase">
                    {c.field}
                  </span>
                  <Badge
                    variant={c.status === "unresolved" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {c.status.replace(/-/g, " ")}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  {c.values.map((v, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <ProviderBadge provider={v.provider} showShort />
                      <span className="font-mono">{v.value}</span>
                    </div>
                  ))}
                </div>
                {c.resolution && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-400" />
                    {c.resolution}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Side-by-side provider records */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitMerge className="h-4 w-4" /> Side-by-Side Provider Records
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveProvider("all")}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                  activeProvider === "all"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                All
              </button>
              {site.providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setActiveProvider(p)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                    activeProvider === p
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <ProviderBadge provider={p} showShort />
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleRecords.map((rec, i) => (
              <ProviderRecordCard key={i} record={rec} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" /> Data Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QualityList findings={site.quality} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProviderRecordCard({ record }: { record: ProviderRecord }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", PROVIDER_COLORS[record.provider])}>
      <div className="mb-3 flex items-center justify-between">
        <ProviderBadge provider={record.provider} />
        <span className="text-[10px] font-mono text-muted-foreground">
          {record.source_id}
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        <FieldRow label="Name" value={record.name} mono />
        {record.description && <FieldRow label="Description" value={record.description} />}
        {record.country && <FieldRow label="Country" value={record.country} />}
        {record.country_code && <FieldRow label="ISO" value={record.country_code} mono />}
        {record.latitude !== undefined && (
          <FieldRow label="Lat" value={record.latitude.toFixed(4)} mono />
        )}
        {record.longitude !== undefined && (
          <FieldRow label="Lon" value={record.longitude.toFixed(4)} mono />
        )}
        <FieldRow
          label="Coords"
          value={record.coordinate_precision}
          mono
        />
        {record.endpoints.map((ep, i) => (
          <FieldRow key={i} label={i === 0 ? "Endpoint" : ""} value={ep} mono />
        ))}
        {record.services.map((svc, i) => (
          <div key={i} className="border-t border-border/40 pt-1.5">
            <FieldRow label="Service" value={svc.name} mono />
            {svc.type && <FieldRow label="Type" value={svc.type} />}
            {svc.implementation && (
              <FieldRow label="Impl" value={svc.implementation} mono />
            )}
          </div>
        ))}
      </div>
      <details className="mt-3">
        <summary className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground cursor-pointer hover:text-foreground">
          <FileJson className="h-3 w-3" /> Raw fields
        </summary>
        <pre className="mt-2 overflow-x-auto rounded bg-secondary/50 p-2 text-[10px] font-mono leading-relaxed">
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
      {label && (
        <span className="w-20 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
          {label}
        </span>
      )}
      <span className={cn("min-w-0 break-all", mono && "font-mono")}>{value}</span>
    </div>
  );
}
