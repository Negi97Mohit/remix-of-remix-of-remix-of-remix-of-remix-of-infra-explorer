import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ShieldCheck, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadges } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { SiteDrawer } from "@/components/site-drawer";
import { cn } from "@/lib/utils";
import type { ConfidenceBand, ReconciledSite } from "@/lib/pipeline/models";
import { DEMO_CANONICAL_SITES, CRIC_SUMMARY_METRICS } from "@/lib/pipeline/cric-demo";

export const Route = createFileRoute("/sites/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "Global Sites Catalogue — CERN CRIC Technical POC" },
      {
        name: "description",
        content:
          "Multi-source federated catalogue of WLCG computing sites. Search and filter across GOCDB, BDII and OSG with field-level provenance inspection.",
      },
      { property: "og:title", content: "Global Sites Catalogue — CERN CRIC Technical POC" },
      {
        property: "og:description",
        content:
          "Multi-source federated catalogue of WLCG computing sites across GOCDB, BDII and OSG.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SitesPage,
});

type SortKey = "name" | "country" | "services" | "score";

function SitesPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<ReconciledSite | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Ensure demo canonical sites (such as verified IISAS-Bratislava and OSG Tier-1) are present
  const allSites = useMemo(() => {
    const live = snapshot.sites;
    const existingIds = new Set(live.map((s) => s.canonical_id));
    const toAdd = DEMO_CANONICAL_SITES.filter((s) => !existingIds.has(s.canonical_id));
    return [...toAdd, ...live];
  }, [snapshot.sites]);

  const countries = useMemo(() => {
    const list = Array.from(new Set(allSites.map((s) => s.country).filter(Boolean))) as string[];
    return list.sort();
  }, [allSites]);

  const filtered = useMemo(() => {
    let result = allSites;
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.canonical_id.toLowerCase().includes(q) ||
          s.country?.toLowerCase().includes(q) ||
          s.country_code?.toLowerCase().includes(q) ||
          s.providers.some((p) => p.includes(q)),
      );
    }

    if (sourceFilter === "reconciled") {
      result = result.filter((s) => s.providers.length > 1);
    } else if (sourceFilter !== "all") {
      result = result.filter((s) => s.providers.includes(sourceFilter as any));
    }

    if (countryFilter !== "all") {
      result = result.filter((s) => s.country === countryFilter);
    }

    if (qualityFilter === "warnings") {
      result = result.filter((s) => s.quality && s.quality.length > 0);
    } else if (qualityFilter === "clean") {
      result = result.filter((s) => !s.quality || s.quality.length === 0);
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "country":
          cmp = (a.country ?? "").localeCompare(b.country ?? "");
          break;
        case "services":
          cmp = a.service_count - b.service_count;
          break;
        case "score":
          cmp = a.score - b.score;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [allSites, query, sortKey, sortDir, sourceFilter, countryFilter, qualityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedSites = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Operational Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 border-l-4 border-l-blue-600 border border-rule bg-card rounded">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            GOCDB Sites Discovered
          </div>
          <div className="text-2xl font-black font-display text-foreground mt-0.5">
            {CRIC_SUMMARY_METRICS.gocdbSitesDiscovered}
          </div>
          <div className="text-[10px] text-muted-foreground">Production REST/XML API</div>
        </div>

        <div className="p-3 border-l-4 border-l-purple-600 border border-rule bg-card rounded">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            BDII Live Endpoints
          </div>
          <div className="text-2xl font-black font-display text-foreground mt-0.5">
            {CRIC_SUMMARY_METRICS.bdiiLiveEndpoints}
          </div>
          <div className="text-[10px] text-muted-foreground">GLUE2 LDAP Query (o=glue)</div>
        </div>

        <div className="p-3 border-l-4 border-l-amber-600 border border-rule bg-card rounded">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            OSG Topology Feed
          </div>
          <div className="text-2xl font-black font-display text-foreground mt-0.5">
            {CRIC_SUMMARY_METRICS.osgResourcesReady}
          </div>
          <div className="text-[10px] text-muted-foreground">2.33 MB XML Resource Hierarchy</div>
        </div>

        <div className="p-3 border-l-4 border-l-emerald-600 border border-rule bg-card rounded">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Multi-Source Reconciled
          </div>
          <div className="text-2xl font-black font-display text-emerald-600 mt-0.5">
            1 (IISAS)
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">85/100 Score Match Verified</div>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-1 border-b border-rule pb-4">
        <h1 className="font-display text-3xl font-black text-foreground">
          Global Sites <em className="font-normal italic text-accent">Catalogue</em>
        </h1>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {allSites.length} computing sites unified across WLCG catalogues.
          Click &quot;Inspect Provenance&quot; on any site to audit its source lineage.
        </p>
      </header>

      {/* Filter Toolbar */}
      <div className="p-3 border border-rule bg-card/60 rounded flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by site name, canonical ID, or country…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full border border-rule bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-accent rounded"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          className="border border-rule bg-background px-2.5 py-1.5 text-xs rounded text-foreground outline-none"
        >
          <option value="all">All Catalogues</option>
          <option value="reconciled">Multi-Source Reconciled</option>
          <option value="gocdb">GOCDB Only</option>
          <option value="bdii">BDII Only</option>
          <option value="osg">OSG Only</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setPage(1);
          }}
          className="border border-rule bg-background px-2.5 py-1.5 text-xs rounded text-foreground outline-none max-w-[160px]"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={qualityFilter}
          onChange={(e) => {
            setQualityFilter(e.target.value);
            setPage(1);
          }}
          className="border border-rule bg-background px-2.5 py-1.5 text-xs rounded text-foreground outline-none"
        >
          <option value="all">All Quality States</option>
          <option value="clean">Valid (Clean)</option>
          <option value="warnings">Valid w/ Warnings</option>
        </select>
      </div>

      {/* High-density Data Grid */}
      <div className="overflow-x-auto border border-rule rounded bg-card">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-rule bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Canonical Site ID & Name" k="name" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Country" k="country" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Services" k="services" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">Catalogues</th>
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Confidence" k="score" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-right">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {paginatedSites.map((site) => (
              <tr key={site.canonical_id} className="hover:bg-accent/5 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-foreground">{site.name}</div>
                  <div className="font-mono text-[10px] text-accent tracking-tight">
                    {site.canonical_id}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-foreground">
                  {site.country ?? "—"}
                  {site.country_code && (
                    <span className="ml-1 text-[10px] text-muted-foreground uppercase font-mono">
                      ({site.country_code})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">
                  {site.service_count}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <ProviderBadges providers={site.providers} />
                    {site.providers.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        Reconciled
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <ConfidenceBadge confidence={site.confidence} score={site.score} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setSelectedSite(site)}
                    className="px-2.5 py-1 bg-foreground text-background hover:bg-foreground/90 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors"
                  >
                    Inspect Provenance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({filtered.length} total sites)
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-rule disabled:opacity-40 hover:bg-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded border border-rule disabled:opacity-40 hover:bg-card"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <SiteDrawer
        site={selectedSite}
        open={Boolean(selectedSite)}
        onOpenChange={(open) => {
          if (!open) setSelectedSite(null);
        }}
      />
    </div>
  );
}

function SortButton({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onClick: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <button
      onClick={() => onClick(k)}
      className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-foreground"
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", active ? "text-accent" : "opacity-40")} />
    </button>
  );
}
