import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown, MapPin } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadges } from "@/components/provider-badge";
import { cn } from "@/lib/utils";
import type { ConfidenceBand } from "@/lib/pipeline/models";

export const Route = createFileRoute("/sites/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "Sites — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Searchable, sortable table of every reconciled WLCG site with provider coverage, service count, and confidence band.",
      },
    ],
  }),
  component: SitesPage,
});

type SortKey = "name" | "country" | "providers" | "services" | "score";

function SitesPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [bandFilter, setBandFilter] = useState<ConfidenceBand | "all">("all");

  const filtered = useMemo(() => {
    let result = snapshot.sites;
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.country?.toLowerCase().includes(q) ||
          s.country_code?.toLowerCase().includes(q) ||
          s.providers.some((p) => p.includes(q)),
      );
    }
    if (bandFilter !== "all") {
      result = result.filter((s) => s.confidence === bandFilter);
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "country": cmp = (a.country ?? "").localeCompare(b.country ?? ""); break;
        case "providers": cmp = a.providers.length - b.providers.length; break;
        case "services": cmp = a.service_count - b.service_count; break;
        case "score": cmp = a.score - b.score; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [snapshot.sites, query, sortKey, sortDir, bandFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const bands: (ConfidenceBand | "all")[] = ["all", "HIGH", "MEDIUM", "REVIEW", "SINGLE"];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Explorer</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {snapshot.sites.length} reconciled sites
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sites, countries, providers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {bands.map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                bandFilter === b
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50",
              )}
            >
              {b === "all" ? "All" : b}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left">
                    <SortButton label="Site" k="name" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-left">
                    <SortButton label="Country" k="country" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-left">Providers</th>
                  <th className="px-4 py-2.5 text-right">
                    <SortButton label="Services" k="services" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-right">
                    <SortButton label="Score" k="score" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-left">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((site) => (
                  <tr
                    key={site.canonical_id}
                    className="border-b border-border/40 transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to="/sites/$id"
                        params={{ id: site.canonical_id.replace("site:", "") }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {site.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {site.country_code && (
                          <MapPin className="h-3 w-3" />
                        )}
                        {site.country ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ProviderBadges providers={site.providers} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-xs">
                      {site.service_count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-xs">
                      {site.score}
                    </td>
                    <td className="px-4 py-2.5">
                      <ConfidenceBadge band={site.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
      className={cn(
        "inline-flex items-center gap-1 transition-colors",
        active ? "text-foreground" : "hover:text-foreground",
      )}
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", active ? "opacity-100" : "opacity-30")} />
      {active && <span className="text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}
