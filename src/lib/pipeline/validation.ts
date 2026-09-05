/**
 * Post-reconciliation validation.
 *
 * The UI is only a viewer: every integrity question about the unification is
 * answered here, on the server, against the finished snapshot. Each check
 * returns a pass/warn/fail verdict plus the concrete rows that triggered it,
 * so a reviewer can see *why* a check failed rather than trusting a green tick.
 */
import { identityKey, hostOf } from "./reconciliation";
import type { ProviderId, Snapshot } from "./models";

export type CheckStatus = "pass" | "warn" | "fail";

export interface ValidationCheck {
  id: string;
  title: string;
  /** Plain-language description of what is being verified and why. */
  question: string;
  status: CheckStatus;
  summary: string;
  /** Concrete offending or notable rows, capped for display. */
  samples: { label: string; detail: string }[];
  /** How many rows matched in total (samples may be truncated). */
  count: number;
}

export interface ValidationReport {
  built_at: string;
  duration_ms: number;
  totals: {
    input_records: number;
    sites: number;
    grouped_records: number;
    multi_provider_sites: number;
    single_provider_sites: number;
    input_services: number;
    grouped_services: number;
    by_provider: { provider: ProviderId; input: number; grouped: number }[];
    by_band: { band: string; count: number }[];
  };
  checks: ValidationCheck[];
  passed: number;
  warned: number;
  failed: number;
}

const SAMPLE_LIMIT = 8;

export function validateSnapshot(snapshot: Snapshot): ValidationReport {
  const started = Date.now();
  const { records, sites } = snapshot;
  const checks: ValidationCheck[] = [];

  const grouped = sites.flatMap((s) => s.records);
  const groupedIds = new Set(grouped.map((r) => r.source_id));

  // 1. Nothing lost: every ingested record ends up inside exactly one site.
  const missing = records.filter((r) => !groupedIds.has(r.source_id));
  checks.push({
    id: "no-record-lost",
    title: "No source record was dropped",
    question:
      "Did every record we read from GOCDB, BDII and OSG end up inside a unified centre?",
    status: missing.length === 0 ? "pass" : "fail",
    summary:
      missing.length === 0
        ? `All ${records.length} ingested records are accounted for across ${sites.length} unified centres.`
        : `${missing.length} of ${records.length} ingested records never reached a unified centre.`,
    samples: missing.slice(0, SAMPLE_LIMIT).map((r) => ({
      label: r.source_id,
      detail: `${r.name} — read from ${r.provider.toUpperCase()} but absent from every group`,
    })),
    count: missing.length,
  });

  // 2. No record counted twice.
  const seen = new Map<string, number>();
  for (const r of grouped) seen.set(r.source_id, (seen.get(r.source_id) ?? 0) + 1);
  const duplicated = [...seen.entries()].filter(([, n]) => n > 1);
  checks.push({
    id: "no-double-count",
    title: "No record was counted twice",
    question: "Was any single source record placed inside more than one centre?",
    status: duplicated.length === 0 ? "pass" : "fail",
    summary:
      duplicated.length === 0
        ? "Each source record belongs to exactly one unified centre."
        : `${duplicated.length} records appear in more than one centre.`,
    samples: duplicated.slice(0, SAMPLE_LIMIT).map(([id, n]) => ({
      label: id,
      detail: `appears in ${n} centres`,
    })),
    count: duplicated.length,
  });

  // 3. Unique canonical ids.
  const idCounts = new Map<string, number>();
  for (const s of sites) idCounts.set(s.canonical_id, (idCounts.get(s.canonical_id) ?? 0) + 1);
  const dupIds = [...idCounts.entries()].filter(([, n]) => n > 1);
  checks.push({
    id: "unique-canonical-id",
    title: "Every unified centre has a unique identifier",
    question: "Could two different centres end up sharing the same identifier?",
    status: dupIds.length === 0 ? "pass" : "fail",
    summary:
      dupIds.length === 0
        ? `${sites.length} identifiers, all distinct.`
        : `${dupIds.length} identifiers are used by more than one centre.`,
    samples: dupIds.slice(0, SAMPLE_LIMIT).map(([id, n]) => ({
      label: id,
      detail: `used ${n} times`,
    })),
    count: dupIds.length,
  });

  // 4. Services preserved.
  const inputServices = records.reduce((n, r) => n + r.services.length, 0);
  const groupedServices = sites.reduce((n, s) => n + s.service_count, 0);
  checks.push({
    id: "services-preserved",
    title: "Service lists survived the merge",
    question: "Do the services listed on the unified centres add up to what we read?",
    status: inputServices === groupedServices ? "pass" : "fail",
    summary:
      inputServices === groupedServices
        ? `${groupedServices} services read, ${groupedServices} services still listed.`
        : `${inputServices} services read but ${groupedServices} listed after unification.`,
    samples: [],
    count: Math.abs(inputServices - groupedServices),
  });

  // 5. Grouping is grounded in evidence, not guesswork.
  const unevidenced = sites.filter((s) => s.providers.length >= 2 && s.evidence.length === 0);
  checks.push({
    id: "evidence-backed",
    title: "Every merge is backed by evidence",
    question:
      "Was any pair of records merged without a single matching signal to justify it?",
    status: unevidenced.length === 0 ? "pass" : "fail",
    summary:
      unevidenced.length === 0
        ? "Every multi-catalogue centre carries at least one recorded matching signal."
        : `${unevidenced.length} centres were merged with no recorded signal.`,
    samples: unevidenced.slice(0, SAMPLE_LIMIT).map((s) => ({
      label: s.name,
      detail: s.providers.join(" + "),
    })),
    count: unevidenced.length,
  });

  // 6. Matches that scored low enough to need a human.
  const review = sites.filter((s) => s.confidence === "REVIEW");
  checks.push({
    id: "needs-review",
    title: "Weak matches flagged for a human",
    question: "Which merges scored too low to be accepted automatically?",
    status: review.length === 0 ? "pass" : "warn",
    summary:
      review.length === 0
        ? "No merge fell below the 45-point review threshold."
        : `${review.length} merges scored under 45 points and are marked for review.`,
    samples: review.slice(0, SAMPLE_LIMIT).map((s) => ({
      label: s.name,
      detail: `score ${s.score} — ${s.providers.join(" + ")}`,
    })),
    count: review.length,
  });

  // 7. Contradictions left standing.
  const unresolved = sites.flatMap((s) =>
    s.conflicts
      .filter((c) => c.status === "unresolved")
      .map((c) => ({ site: s.name, field: c.field, values: c.values })),
  );
  checks.push({
    id: "unresolved-conflicts",
    title: "Contradictions between catalogues",
    question: "Where do two catalogues still state different values for the same field?",
    status: unresolved.length === 0 ? "pass" : "warn",
    summary:
      unresolved.length === 0
        ? "No unresolved field disagreements."
        : `${unresolved.length} fields still disagree; nothing was overwritten.`,
    samples: unresolved.slice(0, SAMPLE_LIMIT).map((c) => ({
      label: `${c.site} · ${c.field}`,
      detail: c.values.map((v) => `${v.provider.toUpperCase()}=${v.value}`).join("  vs  "),
    })),
    count: unresolved.length,
  });

  // 8. Near-misses: records left apart that share a server address.
  //    A real unification bug looks exactly like this.
  const hostIndex = new Map<string, Set<string>>();
  for (const s of sites) {
    for (const r of s.records) {
      for (const ep of r.endpoints) {
        const h = hostOf(ep);
        if (!h || h.split(".").length < 3) continue;
        const set = hostIndex.get(h) ?? new Set<string>();
        set.add(s.canonical_id);
        hostIndex.set(h, set);
      }
    }
  }
  const nearMissHosts = [...hostIndex.entries()].filter(([, ids]) => ids.size > 1);
  checks.push({
    id: "shared-host-not-merged",
    title: "Possible missed unifications",
    question:
      "Do any centres we kept apart actually publish services on the very same server?",
    status: nearMissHosts.length === 0 ? "pass" : "warn",
    summary:
      nearMissHosts.length === 0
        ? "No server address is shared between two separate centres."
        : `${nearMissHosts.length} server addresses are shared by centres that were not merged — candidates the name rule missed.`,
    samples: nearMissHosts.slice(0, SAMPLE_LIMIT).map(([host, ids]) => ({
      label: host,
      detail: [...ids].join("  ·  "),
    })),
    count: nearMissHosts.length,
  });

  // 9. Name normalisation sanity: identity key must reproduce the grouping.
  const keyMismatch = sites.filter((s) =>
    s.records.some((r) => `site:${identityKey(r.name)}` !== s.canonical_id),
  );
  checks.push({
    id: "grouping-reproducible",
    title: "Grouping is reproducible",
    question:
      "If we re-run the name normalisation on each record, does it land in the same centre?",
    status: keyMismatch.length === 0 ? "pass" : "fail",
    summary:
      keyMismatch.length === 0
        ? "Re-deriving the identifier from every record reproduces the grouping exactly."
        : `${keyMismatch.length} centres contain a record whose identifier no longer matches.`,
    samples: keyMismatch.slice(0, SAMPLE_LIMIT).map((s) => ({
      label: s.canonical_id,
      detail: s.records.map((r) => identityKey(r.name)).join(", "),
    })),
    count: keyMismatch.length,
  });

  // 10. Coordinates are physically possible.
  const badCoords = sites.filter(
    (s) =>
      (s.latitude !== undefined && (s.latitude < -90 || s.latitude > 90)) ||
      (s.longitude !== undefined && (s.longitude < -180 || s.longitude > 180)),
  );
  checks.push({
    id: "coordinates-valid",
    title: "Coordinates are inside the real world",
    question: "Are all positions within valid latitude and longitude ranges?",
    status: badCoords.length === 0 ? "pass" : "fail",
    summary:
      badCoords.length === 0
        ? "All positions fall inside valid ranges."
        : `${badCoords.length} centres carry impossible coordinates.`,
    samples: badCoords.slice(0, SAMPLE_LIMIT).map((s) => ({
      label: s.name,
      detail: `${s.latitude}, ${s.longitude}`,
    })),
    count: badCoords.length,
  });

  // 11. Provenance completeness.
  const noProvenance = sites.filter((s) =>
    s.fields.some((f) => f.value !== null && f.provenance.length === 0),
  );
  checks.push({
    id: "provenance-complete",
    title: "Every unified value names its source",
    question: "Is there any value on a unified centre that no catalogue can account for?",
    status: noProvenance.length === 0 ? "pass" : "fail",
    summary:
      noProvenance.length === 0
        ? "Every non-empty unified value carries at least one source reference."
        : `${noProvenance.length} centres hold a value with no traceable source.`,
    samples: noProvenance.slice(0, SAMPLE_LIMIT).map((s) => ({
      label: s.name,
      detail: s.fields
        .filter((f) => f.value !== null && f.provenance.length === 0)
        .map((f) => f.field)
        .join(", "),
    })),
    count: noProvenance.length,
  });

  const providerIds: ProviderId[] = ["gocdb", "bdii", "osg"];
  const bands = ["HIGH", "MEDIUM", "REVIEW", "SINGLE"];

  return {
    built_at: snapshot.built_at,
    duration_ms: Date.now() - started,
    totals: {
      input_records: records.length,
      sites: sites.length,
      grouped_records: grouped.length,
      multi_provider_sites: sites.filter((s) => s.providers.length >= 2).length,
      single_provider_sites: sites.filter((s) => s.providers.length < 2).length,
      input_services: inputServices,
      grouped_services: groupedServices,
      by_provider: providerIds.map((p) => ({
        provider: p,
        input: records.filter((r) => r.provider === p).length,
        grouped: grouped.filter((r) => r.provider === p).length,
      })),
      by_band: bands.map((b) => ({
        band: b,
        count: sites.filter((s) => s.confidence === b).length,
      })),
    },
    checks,
    passed: checks.filter((c) => c.status === "pass").length,
    warned: checks.filter((c) => c.status === "warn").length,
    failed: checks.filter((c) => c.status === "fail").length,
  };
}
