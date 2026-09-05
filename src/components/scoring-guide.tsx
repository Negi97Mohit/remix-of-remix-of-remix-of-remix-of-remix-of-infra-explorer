import { ConfidenceBadge } from "./confidence-badge";

/**
 * The single source of truth *for the reader* about how a match is scored.
 * Mirrors the signals implemented in src/lib/pipeline/reconciliation.ts.
 */
export const SIGNALS = [
  {
    signal: "Domain identifier matched",
    points: 40,
    body: "After stripping case, spaces, underscores and punctuation, the centre names from two catalogues are identical. The strongest single clue.",
  },
  {
    signal: "Endpoint host matched",
    points: 25,
    body: "Both catalogues publish a service on the very same machine address. Two catalogues rarely name the same server by accident.",
  },
  {
    signal: "Country matched",
    points: 20,
    body: "Every catalogue reports the centre in the same country.",
  },
  {
    signal: "Coordinates agree",
    points: 15,
    body: "Both published positions sit within roughly 55 km of each other.",
  },
  {
    signal: "Country disagreement",
    points: -15,
    body: "The catalogues place the centre in different countries. Points are taken away rather than the match being silently dropped.",
  },
] as const;

export const BANDS = [
  {
    band: "HIGH" as const,
    rule: "70 points or more",
    body: "Multiple independent signals agree. Safe to treat as one centre.",
  },
  {
    band: "MEDIUM" as const,
    rule: "45 – 69 points",
    body: "Good evidence, but thinner — usually a name match without a shared server or position.",
  },
  {
    band: "REVIEW" as const,
    rule: "below 45 points",
    body: "Something matched, but not enough to accept automatically. Flagged for a person to judge.",
  },
  {
    band: "SINGLE" as const,
    rule: "only one catalogue",
    body: "No second catalogue describes this centre, so there is nothing to unify and no score is given.",
  },
];

export function ScoringGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold">How points are earned</h3>
        {!compact ? (
          <p className="max-w-prose text-sm text-ink-soft">
            When records from different catalogues fall into the same group, each
            clue that they describe the same real centre is worth a fixed number
            of points. The points are added up, clamped to 0–100, and that total
            decides the confidence label.
          </p>
        ) : null}
        <div className="divide-y divide-rule border border-rule bg-paper">
          {SIGNALS.map((s) => (
            <div key={s.signal} className="flex gap-3 p-3">
              <span
                className={
                  "flex h-7 w-10 shrink-0 items-center justify-center border text-xs font-bold tabular-nums " +
                  (s.points > 0
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-destructive/40 bg-destructive/10 text-destructive")
                }
              >
                {s.points > 0 ? "+" : ""}
                {s.points}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{s.signal}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold">
          How the total becomes a label
        </h3>
        {!compact ? (
          <p className="max-w-prose text-sm text-ink-soft">
            The label is only a reading of the score — it never changes the data.
            Every record stays exactly as its catalogue published it.
          </p>
        ) : null}
        <div className="divide-y divide-rule border border-rule bg-paper">
          {BANDS.map((b) => (
            <div key={b.band} className="flex gap-3 p-3">
              <span className="w-20 shrink-0">
                <ConfidenceBadge band={b.band} />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-semibold">{b.rule}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {b.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Worked example: CERN-PROD appears in two catalogues under the same
          normalized name (+40), both say Switzerland (+20) and both publish the
          same server address (+25) — 85 points, so <strong>High</strong>.
        </p>
      </div>
    </div>
  );
}
