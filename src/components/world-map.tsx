"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Link } from "@tanstack/react-router";
import { X, ArrowUpRight, MapPin } from "lucide-react";
import type { ProviderId, ProviderRecord, ReconciledSite } from "@/lib/pipeline/models";
import { ConfidenceBadge } from "./confidence-badge";
import { ProviderBadge, ProviderBadges } from "./provider-badge";
import { InfoTip } from "./info-tip";
import { cn } from "@/lib/utils";

const WORLD_TOPO_JSON =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MARKER_COLOR: Record<ReconciledSite["confidence"], string> = {
  HIGH: "#b8410e",
  MEDIUM: "#c98a2b",
  REVIEW: "#c53a2a",
  SINGLE: "#8a8378",
};

const PROVIDER_COLOR: Record<ProviderId, string> = {
  gocdb: "#1c1c1c",
  bdii: "#b8410e",
  osg: "#5f7d8c",
};

const PROVIDER_LABEL: Record<ProviderId, string> = {
  gocdb: "GOCDB",
  bdii: "BDII / GLUE2",
  osg: "OSG Topology",
};

interface WorldMapProps {
  sites: ReconciledSite[];
}

type Placed = ReconciledSite & { latitude: number; longitude: number };

interface RecordPoint {
  record: ProviderRecord;
  coords: [number, number];
  /** true when the catalogue published its own position for this record */
  own: boolean;
}

/**
 * Each catalogue's record gets its own dot so the unification is visible:
 * the published position when there is one, otherwise a spoke around the
 * unified centre. Dots are nudged apart so overlapping records stay clickable.
 */
function recordPoints(site: Placed, zoom: number): RecordPoint[] {
  const n = site.records.length;
  const spread = n > 1 ? 1.9 / Math.max(zoom, 1) : 0;
  return site.records.map((r, i) => {
    const own =
      r.coordinate_precision === "exact" &&
      typeof r.latitude === "number" &&
      typeof r.longitude === "number";
    const baseLon = own ? r.longitude! : site.longitude;
    const baseLat = own ? r.latitude! : site.latitude;
    const angle = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
    return {
      record: r,
      own,
      coords: [
        baseLon + Math.cos(angle) * spread,
        baseLat + Math.sin(angle) * spread * 0.75,
      ] as [number, number],
    };
  });
}

export function WorldMap({ sites }: WorldMapProps) {
  const [query, setQuery] = useState("");
  const [onlyMulti, setOnlyMulti] = useState(false);
  const [showSpokes, setShowSpokes] = useState(true);
  const [hovered, setHovered] = useState<{
    site: Placed;
    focus?: ProviderId;
    x: number;
    y: number;
  } | null>(null);
  const [selected, setSelected] = useState<ReconciledSite | null>(null);
  const [position, setPosition] = useState({
    coordinates: [10, 20] as [number, number],
    zoom: 1,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((s) => {
      if (onlyMulti && s.providers.length < 2) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.country ?? "").toLowerCase().includes(q) ||
        s.providers.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [sites, query, onlyMulti]);

  const points = useMemo(
    () =>
      filtered.filter(
        (s): s is Placed =>
          typeof s.latitude === "number" && typeof s.longitude === "number",
      ),
    [filtered],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a centre, country or catalogue…"
            className="min-w-[220px] flex-1 border border-rule bg-paper px-3 py-2 text-sm outline-none focus-visible:border-accent"
          />
          <button
            type="button"
            onClick={() => setOnlyMulti((v) => !v)}
            className={cn(
              "border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
              onlyMulti
                ? "border-accent bg-accent text-accent-foreground"
                : "border-rule text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            Only unified across catalogues
          </button>
          <button
            type="button"
            onClick={() => setShowSpokes((v) => !v)}
            className={cn(
              "border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
              showSpokes
                ? "border-accent bg-accent text-accent-foreground"
                : "border-rule text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            One dot per catalogue
          </button>
        </div>

        <div className="relative h-[560px] overflow-hidden border border-rule bg-paper">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-3 border border-border bg-paper/95 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
            {(
              [
                ["HIGH", "High"],
                ["MEDIUM", "Medium"],
                ["REVIEW", "Review"],
                ["SINGLE", "Single source"],
              ] as const
            ).map(([band, label]) => (
              <span key={band} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: MARKER_COLOR[band] }}
                />
                {label}
              </span>
            ))}
          </div>

          {showSpokes ? (
            <div className="absolute right-3 top-3 z-10 flex flex-wrap gap-3 border border-border bg-paper/95 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
              {(Object.keys(PROVIDER_LABEL) as ProviderId[]).map((p) => (
                <span key={p} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2"
                    style={{ background: PROVIDER_COLOR[p] }}
                  />
                  {PROVIDER_LABEL[p]}
                </span>
              ))}
            </div>
          ) : null}

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 140 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={({ coordinates, zoom }) =>
                setPosition({
                  coordinates: coordinates as [number, number],
                  zoom,
                })
              }
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={WORLD_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(10,10,10,0.055)"
                      stroke="rgba(10,10,10,0.16)"
                      strokeWidth={0.5}
                      className="outline-none"
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {points.map((site) => {
                const multi = site.providers.length >= 2;
                const isActive =
                  selected?.canonical_id === site.canonical_id ||
                  hovered?.site.canonical_id === site.canonical_id;
                const spokes =
                  showSpokes && multi ? recordPoints(site, position.zoom) : [];

                return (
                  <g key={site.canonical_id}>
                    {spokes.map((p) => (
                      <Line
                        key={`${site.canonical_id}-line-${p.record.source_id}`}
                        from={[site.longitude, site.latitude]}
                        to={p.coords}
                        stroke={PROVIDER_COLOR[p.record.provider]}
                        strokeWidth={isActive ? 1.4 : 0.7}
                        strokeOpacity={isActive ? 0.95 : 0.35}
                        strokeLinecap="round"
                      />
                    ))}

                    <Marker coordinates={[site.longitude, site.latitude]}>
                      <g
                        className="cursor-pointer"
                        onMouseEnter={(e) =>
                          setHovered({ site, x: e.clientX, y: e.clientY })
                        }
                        onMouseMove={(e) =>
                          setHovered({ site, x: e.clientX, y: e.clientY })
                        }
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setSelected(site)}
                      >
                        <circle r={10} fill="transparent" />
                        <circle
                          r={multi ? 6.5 : 4.5}
                          fill={MARKER_COLOR[site.confidence]}
                          fillOpacity={isActive ? 0.45 : 0.18}
                          stroke={MARKER_COLOR[site.confidence]}
                          strokeWidth={multi ? 1.6 : 1}
                        />
                        <circle r={2} fill={MARKER_COLOR[site.confidence]} />
                      </g>
                    </Marker>

                    {spokes.map((p) => (
                      <Marker
                        key={`${site.canonical_id}-dot-${p.record.source_id}`}
                        coordinates={p.coords}
                      >
                        <g
                          className="cursor-pointer"
                          onMouseEnter={(e) =>
                            setHovered({
                              site,
                              focus: p.record.provider,
                              x: e.clientX,
                              y: e.clientY,
                            })
                          }
                          onMouseMove={(e) =>
                            setHovered({
                              site,
                              focus: p.record.provider,
                              x: e.clientX,
                              y: e.clientY,
                            })
                          }
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setSelected(site)}
                        >
                          <circle r={7} fill="transparent" />
                          <rect
                            x={-3}
                            y={-3}
                            width={6}
                            height={6}
                            fill={PROVIDER_COLOR[p.record.provider]}
                            fillOpacity={isActive ? 1 : 0.65}
                            stroke="#faf7f2"
                            strokeWidth={0.8}
                          />
                        </g>
                      </Marker>
                    ))}
                  </g>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {hovered ? <HoverCard hovered={hovered} /> : null}
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {points.length} centres shown. A large ring is one unified centre; the
          small squares joined to it are the separate catalogue entries being
          unified into it — one square per catalogue, at the position that
          catalogue published. Hover any of them to see all of them together,
          click to compare them side by side.
        </p>
      </div>

      <SidePanel site={selected} onClose={() => setSelected(null)} />
    </div>
  );
}


function HoverCard({
  hovered,
}: {
  hovered: { site: Placed; focus?: ProviderId; x: number; y: number };
}) {
  const { site, x, y, focus } = hovered;

  return (
    <div
      className="pointer-events-none fixed z-50 w-[320px] border border-rule bg-paper p-3 shadow-xl"
      style={{
        left: Math.min(x + 14, (globalThis.innerWidth ?? 1200) - 340),
        top: Math.max(y - 40, 12),
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-sm font-bold leading-tight">
          {site.name}
        </p>
        <ConfidenceBadge band={site.confidence} />
      </div>
      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <MapPin className="h-3 w-3" /> {site.country ?? "Unknown country"} ·{" "}
        {site.latitude.toFixed(2)}, {site.longitude.toFixed(2)}
      </p>

      <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent">
        {site.records.length === 1
          ? "Described by 1 catalogue"
          : `The same centre in ${site.records.length} catalogues`}
      </p>
      <div className="mt-1.5 divide-y divide-border border-y border-border">
        {site.records.map((r) => (
          <div key={r.source_id} className="flex gap-2 py-1.5">
            <ProviderBadge provider={r.provider} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium">{r.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {r.country ?? "—"} · {r.services.length} services ·{" "}
                {r.endpoints.length} endpoints
              </p>
            </div>
          </div>
        ))}
      </div>

      {site.evidence.length > 0 ? (
        <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">
          Matched on{" "}
          {site.evidence
            .slice(0, 3)
            .map((e) => e.signal)
            .join(", ")}{" "}
          — {site.score} points.
        </p>
      ) : null}
      <p className="mt-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
        Click to compare side-by-side
      </p>
    </div>
  );
}

function SidePanel({
  site,
  onClose,
}: {
  site: ReconciledSite | null;
  onClose: () => void;
}) {
  if (!site) {
    return (
      <aside className="hidden border border-border bg-paper p-5 lg:block">
        <p className="label-micro">Comparison panel</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Click any dot on the map to see how each catalogue describes that same
          computing centre, what evidence tied the records together, and where
          they disagree.
        </p>
      </aside>
    );
  }

  const compareFields: { key: string; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "country", label: "Country" },
    { key: "coords", label: "Coordinates" },
    { key: "services", label: "Services" },
    { key: "endpoints", label: "Endpoints" },
  ];

  const valueFor = (r: ReconciledSite["records"][number], key: string) => {
    switch (key) {
      case "name":
        return r.name;
      case "country":
        return r.country ?? "—";
      case "coords":
        return typeof r.latitude === "number" && typeof r.longitude === "number"
          ? `${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)} (${r.coordinate_precision})`
          : "—";
      case "services":
        return String(r.services.length);
      case "endpoints":
        return r.endpoints.length > 0 ? r.endpoints.slice(0, 2).join(", ") : "—";
      default:
        return "—";
    }
  };

  return (
    <aside className="max-h-[720px] overflow-y-auto border border-rule bg-paper">
      <div className="sticky top-0 flex items-start justify-between gap-2 border-b border-rule bg-paper p-4">
        <div>
          <p className="label-micro">Unified centre</p>
          <h3 className="font-display text-lg font-bold leading-tight">
            {site.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {site.country ?? "Unknown country"} · {site.canonical_id}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close comparison"
          className="border border-border p-1 text-muted-foreground hover:bg-foreground hover:text-background"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge band={site.confidence} />
          <span className="text-[11px] text-muted-foreground">
            {site.score} points
          </span>
          <InfoTip term="confidence" />
          <ProviderBadges providers={site.providers} className="ml-auto" />
        </div>

        <section className="space-y-2">
          <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent">
            Side-by-side <InfoTip term="reconciliation" />
          </p>
          <div className="overflow-x-auto border border-border">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th className="p-2 text-left font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Field
                  </th>
                  {site.records.map((r) => (
                    <th
                      key={r.source_id}
                      className="p-2 text-left font-semibold uppercase tracking-[0.1em]"
                    >
                      {PROVIDER_LABEL[r.provider]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFields.map((f) => {
                  const values = site.records.map((r) => valueFor(r, f.key));
                  const disagree = new Set(values).size > 1;
                  return (
                    <tr key={f.key} className="border-b border-border/70">
                      <td className="p-2 align-top text-muted-foreground">
                        {f.label}
                      </td>
                      {values.map((v, i) => (
                        <td
                          key={i}
                          className={cn(
                            "p-2 align-top break-words",
                            disagree && "bg-accent/8 text-accent",
                          )}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {site.records.length < 2 ? (
            <p className="text-[10.5px] text-muted-foreground">
              Only one catalogue describes this centre, so there is nothing to
              compare yet.
            </p>
          ) : null}
        </section>

        {site.evidence.length > 0 ? (
          <section className="space-y-2">
            <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent">
              Evidence <InfoTip term="evidence" />
            </p>
            <ul className="divide-y divide-border border-y border-border">
              {site.evidence.map((e, i) => (
                <li key={i} className="flex gap-2 py-2">
                  <span className="font-mono text-[10.5px] text-accent">
                    +{e.points}
                  </span>
                  <span className="flex-1 text-[11px] leading-relaxed text-ink-soft">
                    <span className="font-medium text-foreground">
                      {e.signal}
                    </span>{" "}
                    — {e.detail}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {site.conflicts.length > 0 ? (
          <section className="space-y-2">
            <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-destructive">
              Disagreements <InfoTip term="conflict" />
            </p>
            <ul className="space-y-2">
              {site.conflicts.map((c, i) => (
                <li key={i} className="border border-destructive/40 p-2">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em]">
                    {c.field}
                  </p>
                  {c.values.map((v, j) => (
                    <p key={j} className="text-[11px] text-ink-soft">
                      <span className="text-muted-foreground">
                        {PROVIDER_LABEL[v.provider]}:
                      </span>{" "}
                      {v.value}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Link
          to="/sites/$id"
          params={{ id: site.canonical_id.replace("site:", "") }}
          className="inline-flex w-full items-center justify-center gap-1.5 border border-rule bg-foreground px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-background hover:opacity-80"
        >
          Open full trace <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}
