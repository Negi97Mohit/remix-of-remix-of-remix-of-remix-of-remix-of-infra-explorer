import type { ProviderRecord, QualityFinding } from "../models";
import { parseXml, findAll } from "../xml";
import { centroidFor, countryCodeFor } from "../geo";

export const GOCDB_ENDPOINT = "https://goc.egi.eu/gocdbpi/public/?method=get_site_list";

/** Fetch the live GOCDB site registry (REST, XML) and normalize it. */
export async function fetchGocdb(): Promise<{ records: ProviderRecord[]; latency_ms: number }> {
  const started = Date.now();
  const res = await fetch(GOCDB_ENDPOINT, {
    headers: { Accept: "application/xml", "User-Agent": "wlcg-infrastructure-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`GOCDB responded ${res.status}`);
  const xml = await res.text();
  const latency_ms = Date.now() - started;
  const retrieved_at = new Date().toISOString();

  const records = findAll(parseXml(xml), "SITE").map((node) => {
    const a = node.attrs;
    const rawGiis = a["GIIS_URL"] ?? "";
    const giis = rawGiis.trim();
    const name = (a["NAME"] ?? "").trim();
    const country = (a["COUNTRY"] ?? "").trim();
    const code = (a["COUNTRY_CODE"] ?? "").trim() || countryCodeFor(country) || undefined;

    const quality: QualityFinding[] = [];
    if (rawGiis && rawGiis !== giis) {
      quality.push({
        level: "warning",
        field: "GIIS_URL",
        message: "GIIS_URL contains leading or trailing whitespace; trimmed during normalization.",
      });
    }
    if (!giis) {
      quality.push({ level: "warning", field: "GIIS_URL", message: "No GIIS URL published." });
    }
    if (!code) {
      quality.push({ level: "error", field: "COUNTRY_CODE", message: "Missing ISO country code." });
    }
    if (giis && !/^ldap:\/\//i.test(giis)) {
      quality.push({
        level: "warning",
        field: "GIIS_URL",
        message: "GIIS URL does not use the ldap:// scheme.",
      });
    }

    const centroid = centroidFor(code);
    return {
      provider: "gocdb",
      source_id: `gocdb:${a["ID"] ?? name}`,
      native_id: a["ID"] ?? name,
      name,
      country: country || undefined,
      country_code: code,
      latitude: centroid?.[0],
      longitude: centroid?.[1],
      coordinate_precision: centroid ? "country" : "none",
      endpoints: giis ? [giis] : [],
      services: giis
        ? [{ name: "Site BDII (GIIS)", type: "bdii_site", endpoint: giis }]
        : [],
      raw: {
        ID: a["ID"] ?? "",
        PRIMARY_KEY: a["PRIMARY_KEY"] ?? "",
        NAME: a["NAME"] ?? "",
        COUNTRY: a["COUNTRY"] ?? "",
        COUNTRY_CODE: a["COUNTRY_CODE"] ?? "",
        ROC: a["ROC"] ?? "",
        SUBGRID: a["SUBGRID"] ?? "",
        GIIS_URL: rawGiis,
      },
      quality,
      retrieved_at,
    } satisfies ProviderRecord;
  });

  return { records, latency_ms };
}
