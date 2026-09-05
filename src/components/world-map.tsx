"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Link } from "@tanstack/react-router";
import type { ReconciledSite } from "@/lib/pipeline/models";
import { ConfidenceBadge } from "./confidence-badge";
import { ProviderBadges } from "./provider-badge";

const WORLD_TOPO_JSON = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MARKER_COLOR: Record<ReconciledSite["confidence"], string> = {
  HIGH: "#34d399",
  MEDIUM: "#fbbf24",
  REVIEW: "#f87171",
  SINGLE: "#60a5fa",
};

interface WorldMapProps {
  sites: ReconciledSite[];
}

export function WorldMap({ sites }: WorldMapProps) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ coordinates: [10, 20] as [number, number], zoom: 1 });

  const filtered = useMemo(
    () =>
      query.trim()
        ? sites.filter(
            (s) =>
              s.name.toLowerCase().includes(query.toLowerCase()) ||
              (s.country ?? "").toLowerCase().includes(query.toLowerCase()) ||
              s.providers.some((p) => p.toLowerCase().includes(query.toLowerCase())),
          )
        : sites,
    [sites, query],
  );

  const points = useMemo(
    () =>
      filtered.filter(
        (s): s is ReconciledSite & { latitude: number; longitude: number } =>
          typeof s.latitude === "number" && typeof s.longitude === "number",
      ),
    [filtered],
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter sites on the map..."
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none ring-primary focus-visible:ring-1"
        />
      </div>
      <div className="relative h-[560px] overflow-hidden rounded-xl border border-border/60 bg-slate-950/40">
        <div className="absolute left-3 top-3 z-10 flex gap-2 rounded-md border border-border/60 bg-background/90 p-1.5 text-[10px] font-medium backdrop-blur">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> High</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Medium</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Review</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> Single</span>
        </div>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={({ coordinates, zoom }) =>
              setPosition({ coordinates: coordinates as [number, number], zoom })
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
                    fill="rgba(148,163,184,0.12)"
                    stroke="rgba(148,163,184,0.18)"
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
            {points.map((site) => (
              <Marker
                key={site.canonical_id}
                coordinates={[site.longitude, site.latitude]}
              >
                <g className="cursor-pointer">
                  <circle
                    r={5}
                    fill={MARKER_COLOR[site.confidence]}
                    fillOpacity={0.25}
                    stroke={MARKER_COLOR[site.confidence]}
                    strokeWidth={1.5}
                  />
                  <circle
                    r={2}
                    fill={MARKER_COLOR[site.confidence]}
                  />
                  <title>{`${site.name} — ${site.country ?? "unknown country"} (${site.confidence})`}</title>
                </g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <MapTooltipList sites={filtered.slice(0, 12)} />
    </div>
  );
}

function MapTooltipList({ sites }: { sites: ReconciledSite[] }) {
  if (sites.length === 0) {
    return <p className="text-sm text-muted-foreground">No matching sites.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <Link
          key={site.canonical_id}
          to="/sites/$id"
          params={{ id: site.canonical_id.replace("site:", "") }}
          className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-secondary/50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{site.name}</span>
            <ConfidenceBadge band={site.confidence} />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{site.country ?? "—"}</span>
            <ProviderBadges providers={site.providers} />
          </div>
        </Link>
      ))}
    </div>
  );
}
