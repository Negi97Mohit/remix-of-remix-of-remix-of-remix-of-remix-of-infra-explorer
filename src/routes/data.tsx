import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { Database, Search, FileJson, ArrowUpRight } from "lucide-react";
import { recordsQueryOptions } from "@/lib/queries";
import { ProviderBadge } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";

const TITLE = "Raw data — WLCG Infrastructure Explorer";
const DESC =
  "Browse every record read from GOCDB, BDII/GLUE2 and OSG exactly as the catalogue published it, with the unified centre each one belongs to.";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataPage,
});

const PROVIDERS = ["all", "gocdb", "bdii", "osg"] as const;
const PAGE = 25;

function DataPage() {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>("all");
  const [page, setPage] = useState(0);

  const { data, isFetching } = useQuery({
    ...recordsQueryOptions({ query, provider, limit: PAGE, offset: page * PAGE }),
    placeholderData: keepPreviousData,
  });

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3 border-b border-rule pb-6">
        <p className="label-micro">Source data</p>
        <h1 className="font-display text-4xl font-black sm:text-5xl">
          The raw records, unedited
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          Everything below is exactly what the catalogues published — nothing is
          rewritten, merged or removed here. Each row shows the original fields
          and the unified centre that record was placed into, so you can check
          the unification against its own inputs. Search runs on the server over
          every field, including the untouched original values.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search names, countries, server addresses, original fields…"
            className="w-full border border-rule bg-paper py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-accent"
          />
        </div>
        {PROVIDERS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setProvider(p);
              setPage(0);
            }}
            className={cn(
              "border px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-colors",
              provider === p
                ? "border-accent bg-accent text-accent-foreground"
                : "border-rule text-muted-foreground hover:text-foreground",
            )}
          >
            {p === "all" ? "All catalogues" : p}
          </button>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {isFetching ? "Reading…" : `${total.toLocaleString()} matching records`}
        {data ? ` of ${data.grand_total.toLocaleString()} ingested` : null}
      </p>

      <div className="space-y-3">
        {(data?.rows ?? []).map(({ record, canonical_id }) => (
          <article
            key={record.source_id}
            className="border border-rule bg-paper p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <ProviderBadge provider={record.provider} />
                <span className="font-display text-lg font-bold">
                  {record.name}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {record.source_id}
                </span>
              </div>
              {canonical_id ? (
                <Link
                  to="/sites/$id"
                  params={{ id: canonical_id }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent hover:underline"
                >
                  Unified into {canonical_id.replace("site:", "")}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-[10px] uppercase tracking-[0.16em] text-destructive">
                  Not unified
                </span>
              )}
            </div>

            <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Country", record.country ?? "—"],
                ["ISO", record.country_code ?? "—"],
                [
                  "Position",
                  record.latitude !== undefined && record.longitude !== undefined
                    ? `${record.latitude.toFixed(3)}, ${record.longitude.toFixed(3)} (${record.coordinate_precision})`
                    : "—",
                ],
                ["Services", String(record.services.length)],
                ["Endpoints", record.endpoints[0] ?? "—"],
                ["Retrieved", record.retrieved_at],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-20 shrink-0 font-mono text-[9.5px] uppercase text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="min-w-0 break-words font-mono">{v}</dd>
                </div>
              ))}
            </dl>

            <details className="mt-3">
              <summary className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                <FileJson className="h-3 w-3" /> Original catalogue fields (
                {Object.keys(record.raw).length})
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto border border-rule bg-secondary/30 p-3 text-[10px] leading-relaxed">
                {JSON.stringify(record.raw, null, 2)}
              </pre>
            </details>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-rule pt-4">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="border border-rule px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] disabled:opacity-35"
        >
          Previous
        </button>
        <span className="label-micro">
          Page {page + 1} of {pages}
        </span>
        <button
          type="button"
          disabled={page + 1 >= pages}
          onClick={() => setPage((p) => p + 1)}
          className="border border-rule px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] disabled:opacity-35"
        >
          Next
        </button>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        Every value here is stored untouched next to the unified view — see{" "}
        <InfoTip term="provenance">provenance</InfoTip>.
      </p>
    </div>
  );
}
