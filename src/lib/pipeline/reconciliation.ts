import type {
  CanonicalField,
  ConfidenceBand,
  FieldConflict,
  MatchEvidence,
  ProviderId,
  ProviderRecord,
  ProvenanceEntry,
  ReconciledSite,
} from "./models";

/** Identifier normalization: casing, separators and the "-LCG2" style suffixes. */
export function identityKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function hostOf(endpoint?: string): string | undefined {
  if (!endpoint) return undefined;
  const m = endpoint.trim().match(/^(?:[a-z0-9+.-]+:\/\/)?([^/:\s]+)/i);
  return m?.[1]?.toLowerCase();
}

/** Field precedence when providers publish the same canonical field. */
const PRECEDENCE: Record<string, ProviderId[]> = {
  name: ["gocdb", "bdii", "osg"],
  description: ["bdii", "osg", "gocdb"],
  country: ["gocdb", "bdii", "osg"],
  country_code: ["gocdb", "bdii", "osg"],
  latitude: ["bdii", "osg", "gocdb"],
  longitude: ["bdii", "osg", "gocdb"],
  endpoint: ["bdii", "gocdb", "osg"],
};

const SOURCE_FIELD: Record<ProviderId, Record<string, string>> = {
  gocdb: {
    name: "NAME",
    description: "—",
    country: "COUNTRY",
    country_code: "COUNTRY_CODE",
    endpoint: "GIIS_URL",
    latitude: "—",
    longitude: "—",
  },
  bdii: {
    name: "GLUE2DomainID",
    description: "GLUE2DomainDescription",
    country: "GLUE2LocationCountry",
    country_code: "GLUE2LocationCountry",
    endpoint: "GLUE2EndpointURL",
    latitude: "GLUE2LocationLatitude",
    longitude: "GLUE2LocationLongitude",
  },
  osg: {
    name: "GroupName",
    description: "GroupDescription",
    country: "Site/Country",
    country_code: "Site/Country",
    endpoint: "Resource/FQDN",
    latitude: "Site/Latitude",
    longitude: "Site/Longitude",
  },
};

function valueOf(record: ProviderRecord, field: string): string | undefined {
  switch (field) {
    case "name":
      return record.name || undefined;
    case "description":
      return record.description;
    case "country":
      return record.country;
    case "country_code":
      return record.country_code;
    case "endpoint":
      return record.endpoints[0];
    case "latitude":
      return record.coordinate_precision === "exact" ? record.latitude?.toFixed(4) : undefined;
    case "longitude":
      return record.coordinate_precision === "exact" ? record.longitude?.toFixed(4) : undefined;
    default:
      return undefined;
  }
}

const CANONICAL_FIELDS = [
  "name",
  "description",
  "country",
  "country_code",
  "endpoint",
  "latitude",
  "longitude",
];

function buildEvidence(records: ProviderRecord[]): MatchEvidence[] {
  const evidence: MatchEvidence[] = [];
  if (records.length < 2) return evidence;
  const providers = records.map((r) => r.provider);

  const keys = new Set(records.map((r) => identityKey(r.name)));
  if (keys.size === 1) {
    evidence.push({
      signal: "Domain identifier matched",
      detail: `Normalized identifier "${identityKey(records[0]!.name)}" is identical across ${records.length} providers.`,
      points: 40,
      providers,
    });
  }

  const countries = new Set(
    records.map((r) => (r.country_code ?? r.country ?? "").toUpperCase()).filter(Boolean),
  );
  if (countries.size === 1 && records.filter((r) => r.country_code ?? r.country).length > 1) {
    evidence.push({
      signal: "Country matched",
      detail: `All providers report ${records.find((r) => r.country)?.country ?? [...countries][0]}.`,
      points: 20,
      providers,
    });
  } else if (countries.size > 1) {
    evidence.push({
      signal: "Country disagreement",
      detail: `Providers report different countries: ${[...countries].join(", ")}.`,
      points: -15,
      providers,
    });
  }

  const hostSets = records.map((r) => new Set(r.endpoints.map(hostOf).filter(Boolean) as string[]));
  const sharedHost = [...(hostSets[0] ?? [])].find((h) => hostSets.every((s) => s.has(h)));
  if (sharedHost) {
    evidence.push({
      signal: "Endpoint host matched",
      detail: `Both providers publish endpoints on ${sharedHost}.`,
      points: 25,
      providers,
    });
  }

  const withCoords = records.filter((r) => r.coordinate_precision === "exact");
  if (withCoords.length >= 2) {
    const [a, b] = withCoords;
    const dist = Math.hypot((a!.latitude ?? 0) - (b!.latitude ?? 0), (a!.longitude ?? 0) - (b!.longitude ?? 0));
    if (dist < 0.5) {
      evidence.push({
        signal: "Coordinates agree",
        detail: `Published positions are within ${(dist * 111).toFixed(0)} km of each other.`,
        points: 15,
        providers,
      });
    }
  }

  return evidence;
}

function bandFor(score: number, providerCount: number): ConfidenceBand {
  if (providerCount < 2) return "SINGLE";
  if (score >= 70) return "HIGH";
  if (score >= 45) return "MEDIUM";
  return "REVIEW";
}

/** Group provider records into canonical sites, keeping every source record. */
export function reconcile(records: ProviderRecord[]): ReconciledSite[] {
  const groups = new Map<string, ProviderRecord[]>();
  for (const record of records) {
    const key = identityKey(record.name);
    if (!key) continue;
    const list = groups.get(key);
    if (list) list.push(record);
    else groups.set(key, [record]);
  }

  const sites: ReconciledSite[] = [];
  for (const [key, group] of groups) {
    const evidence = buildEvidence(group);
    const score = Math.max(
      0,
      Math.min(100, evidence.reduce((sum, e) => sum + e.points, 0)),
    );
    const providerOrder: ProviderId[] = ["gocdb", "bdii", "osg"];
    const providers = providerOrder.filter((p) => group.some((r) => r.provider === p));

    const fields: CanonicalField[] = [];
    const conflicts: FieldConflict[] = [];

    for (const field of CANONICAL_FIELDS) {
      const contributions = group
        .map((r) => ({ record: r, value: valueOf(r, field) }))
        .filter((c) => c.value !== undefined && c.value !== "");
      const provenance: ProvenanceEntry[] = contributions.map((c) => ({
        provider: c.record.provider,
        source_id: c.record.source_id,
        source_field: SOURCE_FIELD[c.record.provider]?.[field] ?? field,
        value: c.value!,
        retrieved_at: c.record.retrieved_at,
      }));

      const order = PRECEDENCE[field] ?? providerOrder;
      const chosen = order
        .map((p) => contributions.find((c) => c.record.provider === p))
        .find(Boolean);

      fields.push({
        field,
        value: chosen?.value ?? null,
        selected_from: chosen?.record.provider ?? null,
        provenance,
      });

      const distinct = new Set(contributions.map((c) => c.value!.toLowerCase()));
      const comparable = field === "country" || field === "country_code" || field === "name";
      if (comparable && distinct.size > 1) {
        conflicts.push({
          field,
          values: contributions.map((c) => ({
            provider: c.record.provider,
            source_id: c.record.source_id,
            value: c.value!,
          })),
          status: field === "country" ? "unresolved" : "resolved-by-precedence",
          resolution:
            field === "country"
              ? undefined
              : `Kept ${chosen?.record.provider.toUpperCase()} value by field precedence; every source value is preserved.`,
        });
      }
    }

    const coordSource =
      group.find((r) => r.provider === "bdii" && r.coordinate_precision === "exact") ??
      group.find((r) => r.coordinate_precision === "exact") ??
      group.find((r) => r.coordinate_precision === "country");

    const services = group.flatMap((r) => r.services);
    sites.push({
      canonical_id: `site:${key}`,
      name: fields.find((f) => f.field === "name")?.value?.toString() ?? group[0]!.name,
      country: fields.find((f) => f.field === "country")?.value?.toString() ?? undefined,
      country_code: fields.find((f) => f.field === "country_code")?.value?.toString() ?? undefined,
      latitude: coordSource?.latitude,
      longitude: coordSource?.longitude,
      coordinate_precision: coordSource?.coordinate_precision ?? "none",
      providers,
      source_ids: group.map((r) => r.source_id),
      service_count: services.length,
      services,
      score,
      confidence: bandFor(score, providers.length),
      evidence,
      fields,
      conflicts,
      quality: group.flatMap((r) => r.quality),
      records: group,
    });
  }

  return sites.sort((a, b) => a.name.localeCompare(b.name));
}
