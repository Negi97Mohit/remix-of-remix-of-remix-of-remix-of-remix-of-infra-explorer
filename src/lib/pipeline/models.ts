/**
 * Canonical data model shared by every provider adapter.
 *
 * Provider records are never mutated or overwritten by reconciliation:
 * a ReconciledSite only *references* them and records provenance.
 */

export type ProviderId = "gocdb" | "bdii" | "osg";

export type Protocol = "REST/XML" | "LDAP/GLUE2" | "HTTP/XML";

export type QualityLevel = "info" | "warning" | "error";

export interface QualityFinding {
  level: QualityLevel;
  field: string;
  message: string;
}

export interface NormalizedService {
  name: string;
  type?: string | undefined;
  endpoint?: string | undefined;
  implementation?: string | undefined;
  version?: string | undefined;
}

/** One provider's description of one site, after normalization. */
export interface ProviderRecord {
  provider: ProviderId;
  /** Stable provider-scoped id, e.g. "gocdb:41" or "bdii:IISAS-Bratislava". */
  source_id: string;
  /** Native identifier inside the provider system. */
  native_id: string;
  name: string;
  description?: string | undefined;
  country?: string | undefined;
  country_code?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  /** Where the coordinates came from: provider-supplied or country centroid. */
  coordinate_precision: "exact" | "country" | "none";
  endpoints: string[];
  services: NormalizedService[];
  /** Provider-native fields kept verbatim; nothing is discarded. */
  raw: Record<string, string>;
  quality: QualityFinding[];
  retrieved_at: string;
}

export interface MatchEvidence {
  signal: string;
  detail: string;
  points: number;
  providers: ProviderId[];
}

export type ConfidenceBand = "HIGH" | "MEDIUM" | "REVIEW" | "SINGLE";

export interface ProvenanceEntry {
  provider: ProviderId;
  source_id: string;
  source_field: string;
  value: string;
  retrieved_at: string;
}

export interface CanonicalField {
  field: string;
  value: string | number | null;
  /** Provider chosen as the authoritative value for this field. */
  selected_from: ProviderId | null;
  provenance: ProvenanceEntry[];
}

export interface FieldConflict {
  field: string;
  values: { provider: ProviderId; source_id: string; value: string }[];
  status: "unresolved" | "resolved-by-precedence";
  resolution?: string | undefined;
}

export interface ReconciledSite {
  canonical_id: string;
  name: string;
  country?: string | undefined;
  country_code?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  coordinate_precision: "exact" | "country" | "none";
  providers: ProviderId[];
  source_ids: string[];
  service_count: number;
  services: NormalizedService[];
  score: number;
  confidence: ConfidenceBand;
  evidence: MatchEvidence[];
  fields: CanonicalField[];
  conflicts: FieldConflict[];
  quality: QualityFinding[];
  records: ProviderRecord[];
}

export interface ProviderHealth {
  provider: ProviderId;
  label: string;
  protocol: Protocol;
  transport: string;
  endpoint: string;
  mode: "live" | "snapshot";
  status: "healthy" | "degraded" | "error";
  record_count: number;
  latency_ms: number | null;
  last_retrieved: string | null;
  note?: string | undefined;
  error?: string | undefined;
}

export interface Snapshot {
  built_at: string;
  duration_ms: number;
  providers: ProviderHealth[];
  records: ProviderRecord[];
  sites: ReconciledSite[];
}
