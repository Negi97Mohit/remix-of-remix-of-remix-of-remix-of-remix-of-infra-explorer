/**
 * Pipeline orchestrator: fetch every provider in parallel, reconcile, and
 * produce a Snapshot. Per-provider failures are caught so one down provider
 * never blanks the whole page — the provider shows as "error" in the health
 * list and its records are simply absent from the reconciliation.
 */
import type { ProviderHealth, ProviderId, ProviderRecord, Snapshot } from "./models";
import { fetchGocdb, GOCDB_ENDPOINT } from "./providers/gocdb";
import { fetchBdii, BDII_ENDPOINT } from "./providers/bdii";
import { fetchOsg, OSG_ENDPOINT } from "./providers/osg";
import { reconcile } from "./reconciliation";

const PROTOCOL_LABEL: Record<ProviderId, string> = {
  gocdb: "GOCDB",
  bdii: "BDII (GLUE2)",
  osg: "OSG Topology",
};

const TRANSPORT: Record<ProviderId, string> = {
  gocdb: "REST/XML",
  bdii: "LDAP/GLUE2",
  osg: "HTTP/XML",
};

interface ProviderResult {
  records: ProviderRecord[];
  latency_ms: number;
  mode?: "live" | "snapshot" | undefined;
  error?: string | undefined;
}

async function safeFetch(
  provider: ProviderId,
  fn: () => Promise<{ records: ProviderRecord[]; latency_ms: number; mode?: "live" | "snapshot" }>,
): Promise<ProviderResult> {
  const started = Date.now();
  try {
    const result = await fn();
    return { records: result.records, latency_ms: result.latency_ms, mode: result.mode };
  } catch (err) {
    return {
      records: [],
      latency_ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function buildSnapshot(): Promise<Snapshot> {
  const started = Date.now();

  const [gocdbRes, bdiiRes, osgRes] = await Promise.all([
    safeFetch("gocdb", () => fetchGocdb()),
    safeFetch("bdii", () => fetchBdii(process.env["BDII_BRIDGE_URL"])),
    safeFetch("osg", () => fetchOsg()),
  ]);

  const results: Record<ProviderId, ProviderResult> = {
    gocdb: gocdbRes,
    bdii: bdiiRes,
    osg: osgRes,
  };

  const allRecords = [...gocdbRes.records, ...bdiiRes.records, ...osgRes.records];

  const providers: ProviderHealth[] = (["gocdb", "bdii", "osg"] as ProviderId[]).map((p) => {
    const r = results[p];
    const endpoint = p === "gocdb" ? GOCDB_ENDPOINT : p === "bdii" ? BDII_ENDPOINT : OSG_ENDPOINT;
    const mode = p === "bdii" ? (r.mode ?? "snapshot") : "live";
    const status: ProviderHealth["status"] = r.error
      ? "error"
      : r.records.length === 0
        ? "degraded"
        : "healthy";
    const lastRetrieved =
      r.records.length > 0 ? r.records[0]!.retrieved_at : null;

    let note: string | undefined;
    if (p === "bdii" && !r.error) {
      note = "Snapshot mode — raw LDAP (port 2170) is unreachable from the edge runtime.";
    }
    if (r.error) note = r.error;

    return {
      provider: p,
      label: PROTOCOL_LABEL[p],
      protocol: TRANSPORT[p] as ProviderHealth["protocol"],
      transport: TRANSPORT[p],
      endpoint,
      mode,
      status,
      record_count: r.records.length,
      latency_ms: r.error ? null : r.latency_ms,
      last_retrieved: lastRetrieved,
      note,
      error: r.error,
    };
  });

  const sites = reconcile(allRecords);

  return {
    built_at: new Date().toISOString(),
    duration_ms: Date.now() - started,
    providers,
    records: allRecords,
    sites,
  };
}
