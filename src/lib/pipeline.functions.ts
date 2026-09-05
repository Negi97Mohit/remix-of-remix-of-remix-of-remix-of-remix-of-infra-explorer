/**
 * Server functions exposing the WLCG pipeline to the client.
 *
 * `getSnapshot` / `getProviders` share a 60s in-memory cache so repeated
 * navigations (and the World Map + Dashboard + Sites pages all loading at
 * once) don't re-fetch the ~2.4 MB OSG topology on every hit.
 */
import { createServerFn } from "@tanstack/react-start";
import type { ProviderHealth, ProviderRecord, Snapshot } from "@/lib/pipeline/models";
import { buildSnapshot } from "@/lib/pipeline/snapshot";

const CACHE_TTL_MS = 60_000;

let cached: { snapshot: Snapshot; at: number } | null = null;

async function getOrBuild(): Promise<Snapshot> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.snapshot;
  }
  const snapshot = await buildSnapshot();
  cached = { snapshot, at: now };
  return snapshot;
}

/** Full reconciled snapshot: every provider record + every reconciled site. */
export const getSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return await getOrBuild();
});

/** Lightweight provider-health summary (no records/sites shipped). */
export const getProviders = createServerFn({ method: "GET" }).handler(async () => {
  const snapshot = await getOrBuild();
  return snapshot.providers;
});

/** A single reconciled site plus its source records, for the detail page. */
export const getSite = createServerFn({ method: "GET" })
  .validator((data: { canonical_id: string }) => data)
  .handler(async ({ data }) => {
    const snapshot = await getOrBuild();
    const site = snapshot.sites.find(
      (s) => s.canonical_id === data.canonical_id,
    );
    if (!site) return null;
    return site;
  });

export type GetSnapshotResult = Snapshot;
export type GetProvidersResult = ProviderHealth[];
export type GetSiteResult = ReturnType<typeof getSite> extends Promise<infer T>
  ? T
  : never;
export type SiteRecord = ProviderRecord;

/**
 * Server-side validation of the finished snapshot. The browser only renders
 * the verdicts — every integrity test runs here.
 */
export const getValidation = createServerFn({ method: "GET" }).handler(async () => {
  const snapshot = await getOrBuild();
  const { validateSnapshot } = await import("@/lib/pipeline/validation");
  return validateSnapshot(snapshot);
});

/**
 * Searchable window over the raw ingested records. Filtering happens on the
 * server so the browser never has to download every catalogue payload.
 */
export const getRecords = createServerFn({ method: "GET" })
  .validator(
    (data: {
      query?: string;
      provider?: ProviderRecord["provider"] | "all";
      limit?: number;
      offset?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const snapshot = await getOrBuild();
    const siteOf = new Map<string, string>();
    for (const s of snapshot.sites) {
      for (const r of s.records) siteOf.set(r.source_id, s.canonical_id);
    }

    const q = (data.query ?? "").trim().toLowerCase();
    const provider = data.provider ?? "all";
    const filtered = snapshot.records.filter((r) => {
      if (provider !== "all" && r.provider !== provider) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.source_id.toLowerCase().includes(q) ||
        (r.country ?? "").toLowerCase().includes(q) ||
        r.endpoints.some((e) => e.toLowerCase().includes(q)) ||
        Object.values(r.raw).some((v) => String(v).toLowerCase().includes(q))
      );
    });

    const offset = data.offset ?? 0;
    const limit = Math.min(data.limit ?? 40, 100);
    return {
      total: filtered.length,
      grand_total: snapshot.records.length,
      offset,
      limit,
      built_at: snapshot.built_at,
      rows: filtered.slice(offset, offset + limit).map((r) => ({
        record: r,
        canonical_id: siteOf.get(r.source_id) ?? null,
      })),
    };
  });
