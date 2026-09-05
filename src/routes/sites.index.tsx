import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { snapshotQueryOptions } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ProviderBadges } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";
import type { ConfidenceBand } from "@/lib/pipeline/models";

export const Route = createFileRoute("/sites/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "All Centres — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Search and filter every unified computing centre: which catalogues describe it, how many services it offers, and how confident the match is.",
      },
      { property: "og:title", content: "All Centres — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "Search and filter every unified computing centre across GOCDB, BDII and OSG with match confidence.",
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
  }, [snapshot.sites, query, sortKey, sortDir, bandFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const bands: (ConfidenceBand | "all")[] = [
    "all",
    "HIGH",
    "MEDIUM",
    "REVIEW",
    "SINGLE",
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">All centres</p>
        <h1 className="font-display text-4xl font-black">
          Every unified{" "}
          <em className="font-normal italic text-accent">computing centre</em>
        </h1>
        <p className="text-sm text-ink-soft">
          {filtered.length} of {snapshot.sites.length} shown. Each row is one
          real place, assembled from whichever catalogues describe it.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search a centre, country or catalogue…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-rule bg-paper py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-accent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {bands.map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className={cn(
                "border px-2.5 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-colors",
                bandFilter === b
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {b === "all" ? "All" : b}
            </button>
          ))}
          <InfoTip term="confidence" className="ml-1" />
        </div>
      </div>

      <div className="overflow-x-auto border border-rule">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule bg-secondary/50 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Centre" k="name" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">
                <SortButton label="Country" k="country" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">
                <span className="inline-flex items-center gap-1">
                  Catalogues <InfoTip term="provider" />
                </span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <SortButton label="Services" k="services" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-right">
                <SortButton label="Score" k="score" {...{ sortKey, sortDir }} onClick={toggleSort} />
              </th>
              <th className="px-4 py-2.5 text-left">Match</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => (
              <tr
                key={site.canonical_id}
                className="border-b border-border/70 transition-colors hover:bg-secondary/50"
              >
                <td className="px-4 py-2.5">
                  <Link
                    to="/sites/$id"
                    params={{ id: site.canonical_id.replace("site:", "") }}
                    className="font-medium hover:text-accent"
                  >
                    {site.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                  {site.country ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <ProviderBadges providers={site.providers} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">
                  {site.service_count}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">
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
        "inline-flex items-center gap-1 uppercase tracking-[0.14em] transition-colors",
        active ? "text-foreground" : "hover:text-foreground",
      )}
    >
      {label}
      <ArrowUpDown
        className={cn("h-3 w-3", active ? "opacity-100" : "opacity-30")}
      />
      {active ? (
        <span className="text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>
      ) : null}
    </button>
  );
}
