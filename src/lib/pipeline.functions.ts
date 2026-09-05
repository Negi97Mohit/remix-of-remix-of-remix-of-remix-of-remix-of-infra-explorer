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
  .inputValidator((data: { canonical_id: string }) => data)
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
