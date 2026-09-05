import type { ProviderRecord, QualityFinding } from "../models";
import { countryCodeFor } from "../geo";
import {
  BDII_BASE_DN,
  BDII_HOST,
  BDII_PORT,
  BDII_SNAPSHOT,
  BDII_SNAPSHOT_CAPTURED_AT,
} from "./bdii-snapshot";

export const BDII_ENDPOINT = `ldap://${BDII_HOST}:${BDII_PORT}/${BDII_BASE_DN}`;

/**
 * BDII adapter.
 *
 * Reads GLUE2 entries from a captured snapshot because raw LDAP (port 2170)
 * is not reachable from this runtime. Set BDII_BRIDGE_URL to an HTTPS bridge
 * that returns the same GLUE2 JSON shape to run this adapter live.
 */
export async function fetchBdii(
  bridgeUrl?: string,
): Promise<{ records: ProviderRecord[]; latency_ms: number; mode: "live" | "snapshot" }> {
  const started = Date.now();
  let entries = BDII_SNAPSHOT;
  let mode: "live" | "snapshot" = "snapshot";
  let retrieved_at = BDII_SNAPSHOT_CAPTURED_AT;

  if (bridgeUrl) {
    const res = await fetch(bridgeUrl, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`BDII bridge responded ${res.status}`);
    entries = (await res.json()) as typeof BDII_SNAPSHOT;
    mode = "live";
    retrieved_at = new Date().toISOString();
  }

  const records = entries.map((e) => {
    const quality: QualityFinding[] = [];
    if (e.GLUE2LocationLatitude === undefined || e.GLUE2LocationLongitude === undefined) {
      quality.push({
        level: "warning",
        field: "GLUE2Location",
        message: "GLUE2Location publishes no latitude/longitude.",
      });
    }
    if (e.GLUE2EndpointHealthState !== "ok") {
      quality.push({
        level: "warning",
        field: "GLUE2EndpointHealthState",
        message: `Endpoint health state is "${e.GLUE2EndpointHealthState}".`,
      });
    }
    const hasCoords =
      e.GLUE2LocationLatitude !== undefined && e.GLUE2LocationLongitude !== undefined;

    return {
      provider: "bdii",
      source_id: `bdii:${e.GLUE2DomainID}`,
      native_id: e.GLUE2DomainID,
      name: e.GLUE2DomainID,
      description: e.GLUE2DomainDescription,
      country: e.GLUE2LocationCountry,
      country_code: countryCodeFor(e.GLUE2LocationCountry),
      latitude: e.GLUE2LocationLatitude,
      longitude: e.GLUE2LocationLongitude,
      coordinate_precision: hasCoords ? "exact" : "none",
      endpoints: [e.GLUE2EndpointURL],
      services: [
        {
          name: e.GLUE2ServiceID,
          type: e.GLUE2ServiceType,
          endpoint: e.GLUE2EndpointURL,
          implementation: e.GLUE2EndpointImplementationName,
          version: e.GLUE2EndpointImplementationVersion,
        },
      ],
      raw: {
        GLUE2DomainID: e.GLUE2DomainID,
        GLUE2DomainDescription: e.GLUE2DomainDescription,
        GLUE2LocationCountry: e.GLUE2LocationCountry,
        GLUE2LocationLatitude: String(e.GLUE2LocationLatitude ?? ""),
        GLUE2LocationLongitude: String(e.GLUE2LocationLongitude ?? ""),
        GLUE2ServiceID: e.GLUE2ServiceID,
        GLUE2ServiceType: e.GLUE2ServiceType,
        GLUE2EndpointURL: e.GLUE2EndpointURL,
        GLUE2EndpointImplementationName: e.GLUE2EndpointImplementationName,
        GLUE2EndpointImplementationVersion: e.GLUE2EndpointImplementationVersion,
        GLUE2EndpointHealthState: e.GLUE2EndpointHealthState,
      },
      quality,
      retrieved_at,
    } satisfies ProviderRecord;
  });

  return { records, latency_ms: Date.now() - started, mode };
}
