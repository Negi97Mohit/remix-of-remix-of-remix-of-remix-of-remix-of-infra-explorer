import type { NormalizedService, ProviderRecord, QualityFinding } from "../models";
import { parseXml, findAll, child, textOf } from "../xml";
import { centroidFor, countryCodeFor } from "../geo";

export const OSG_ENDPOINT = "https://topology.opensciencegrid.org/rgsummary/xml";

/** Fetch live OSG topology (HTTP, XML) and normalize resource groups. */
export async function fetchOsg(): Promise<{ records: ProviderRecord[]; latency_ms: number }> {
  const started = Date.now();
  const res = await fetch(OSG_ENDPOINT, {
    headers: { Accept: "application/xml", "User-Agent": "wlcg-infrastructure-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`OSG topology responded ${res.status}`);
  const xml = await res.text();
  const latency_ms = Date.now() - started;
  const retrieved_at = new Date().toISOString();

  const records = findAll(parseXml(xml), "ResourceGroup").map((group) => {
    const site = child(group, "Site");
    const facility = child(group, "Facility");
    const groupName = textOf(group, "GroupName");
    const country = textOf(site, "Country") || undefined;
    const code = countryCodeFor(country);
    const latRaw = textOf(site, "Latitude");
    const lonRaw = textOf(site, "Longitude");
    const lat = latRaw ? Number(latRaw) : NaN;
    const lon = lonRaw ? Number(lonRaw) : NaN;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) && !(lat === 0 && lon === 0);

    const services: NormalizedService[] = [];
    const endpoints: string[] = [];
    for (const resource of findAll(group, "Resource")) {
      const fqdn = textOf(resource, "FQDN");
      if (fqdn) endpoints.push(fqdn);
      for (const svc of findAll(resource, "Service")) {
        services.push({
          name: textOf(svc, "Name"),
          type: textOf(svc, "Description") || undefined,
          endpoint: fqdn || undefined,
          implementation: textOf(resource, "Name") || undefined,
        });
      }
    }

    const quality: QualityFinding[] = [];
    if (!hasCoords) {
      quality.push({
        level: "warning",
        field: "Site/Latitude",
        message: "Resource group publishes no usable coordinates; country centroid used instead.",
      });
    }
    if (!country) {
      quality.push({ level: "error", field: "Site/Country", message: "No country published." });
    }
    if (endpoints.length === 0) {
      quality.push({ level: "info", field: "Resources", message: "No resource FQDN published." });
    }

    const centroid = centroidFor(code);
    return {
      provider: "osg",
      source_id: `osg:${textOf(group, "GroupID") || groupName}`,
      native_id: textOf(group, "GroupID") || groupName,
      name: groupName,
      description: textOf(group, "GroupDescription") || undefined,
      country,
      country_code: code,
      latitude: hasCoords ? lat : centroid?.[0],
      longitude: hasCoords ? lon : centroid?.[1],
      coordinate_precision: hasCoords ? "exact" : centroid ? "country" : "none",
      endpoints,
      services,
      raw: {
        GroupID: textOf(group, "GroupID"),
        GroupName: groupName,
        GridType: textOf(group, "GridType"),
        Production: textOf(group, "Production"),
        Disable: textOf(group, "Disable"),
        Facility: textOf(facility, "Name"),
        SiteID: textOf(site, "ID"),
        SiteName: textOf(site, "Name"),
        City: textOf(site, "City"),
        State: textOf(site, "State"),
        Country: textOf(site, "Country"),
        Latitude: latRaw,
        Longitude: lonRaw,
        SupportCenter: textOf(child(group, "SupportCenter"), "Name"),
        ResourceCount: String(findAll(group, "Resource").length),
      },
      quality,
      retrieved_at,
    } satisfies ProviderRecord;
  });

  return { records, latency_ms };
}
