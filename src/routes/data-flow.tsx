import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/data-flow")({
  head: () => ({
    meta: [
      { title: "Data Flow — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Pipeline architecture: GOCDB, BDII and OSG are ingested, normalized, validated, reconciled and exposed through the API.",
      },
      { property: "og:title", content: "Data Flow — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "Pipeline architecture: GOCDB, BDII and OSG are ingested, normalized, validated, reconciled and exposed through the API.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataFlowPage,
});

const STAGES = [
  {
    id: "ingest",
    label: "Ingest",
    subs: ["GOCDB REST/XML", "BDII LDAP/GLUE2 snapshot", "OSG XML"],
  },
  {
    id: "adapters",
    label: "Adapters",
    subs: ["XML parser", "GLUE2 reader", "Record mapping"],
  },
  {
    id: "normalize",
    label: "Normalize",
    subs: ["Common schema", "Quality checks", "Raw fields kept"],
  },
  {
    id: "validate",
    label: "Validate",
    subs: ["Missing fields", "Format checks", "Whitespace warnings"],
  },
  {
    id: "reconcile",
    label: "Reconcile",
    subs: ["Evidence scoring", "Confidence bands", "Conflict detection"],
  },
  {
    id: "canonical",
    label: "Canonical Dataset",
    subs: ["Merged centre records", "Provenance links"],
  },
  {
    id: "api",
    label: "API",
    subs: ["REST endpoints", "JSON responses"],
  },
  {
    id: "ui",
    label: "React UI",
    subs: ["Dashboard", "Map", "Centre detail"],
  },
];

function DataFlowPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2 border-b border-rule pb-6 text-center">
        <p className="label-micro">Pipeline</p>
        <h1 className="font-display text-4xl font-black">
          From raw catalogues to{" "}
          <em className="font-normal italic text-accent">one dataset</em>
        </h1>
        <p className="mx-auto max-w-xl text-sm text-ink-soft">
          Each stage keeps the previous stage honest. Nothing is overwritten; raw
          records and provenance travel all the way to the UI.
        </p>
      </header>

      <div className="flex flex-col items-center gap-3">
        {STAGES.map((stage, index) => (
          <StageNode key={stage.id} stage={stage} index={index} />
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          Where the data actually comes from
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Nothing here is invented. Each row below is a real public catalogue,
          read when the page is built, in the format that catalogue publishes.
        </p>
        <div className="divide-y divide-border border-y border-border">
          {SOURCES.map((s) => (
            <div key={s.name} className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {s.name}
                </p>
                <p className="text-[10.5px] text-muted-foreground">{s.region}</p>
              </div>
              <div className="space-y-1.5">
                <p className="break-all font-mono text-[10.5px] text-muted-foreground">
                  {s.endpoint}
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">{s.reads}</p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold">We take:</span> {s.takes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          How we decide two entries are the same centre
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Entries are never merged because a person said so. Each catalogue
          entry's name is first stripped down to a comparable form — lowercase,
          spaces and underscores turned into hyphens, punctuation removed — and
          entries that reduce to the same form are put in one group. The group is
          then tested against the checks below, and the points add up to the
          score you see on every match.
        </p>
        <div className="divide-y divide-border border-y border-border">
          {RULES.map((r) => (
            <div key={r.signal} className="grid gap-2 py-4 sm:grid-cols-[80px_1fr]">
              <span
                className={
                  r.points > 0
                    ? "font-mono text-sm font-semibold text-accent"
                    : "font-mono text-sm font-semibold text-destructive"
                }
              >
                {r.points > 0 ? `+${r.points}` : r.points}
              </span>
              <div>
                <p className="text-sm font-semibold">{r.signal}</p>
                <p className="text-sm leading-relaxed text-ink-soft">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          70 points or more is a high-confidence match, 45 or more is medium,
          anything lower is flagged for a human to decide, and an entry no other
          catalogue knows about is marked as single-source. When two catalogues
          state different values for the same field, the disagreement is shown
          rather than resolved away.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="border border-rule bg-paper p-5">
          <h2 className="font-display text-lg font-bold">Provider diversity</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            GOCDB, BDII and OSG Topology describe the same physical centres in
            different formats. The adapter layer decouples parsing from semantics so
            each source can evolve independently.
          </p>
        </div>
        <div className="border border-rule bg-paper p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            Provenance by design <InfoTip term="provenance" />
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Every canonical field stores a provenance trail: which catalogue, which
            source ID, which native field, and when it was retrieved. Nothing is
            silently overwritten.
          </p>
        </div>
      </div>
    </div>
  );
}

function StageNode({
  stage,
  index,
}: {
  stage: (typeof STAGES)[number];
  index: number;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="w-full border border-rule bg-paper p-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center border border-accent/40 bg-accent/10 text-[11px] font-bold text-accent">
            {index + 1}
          </span>
          <span className="font-display font-semibold">{stage.label}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.subs.map((sub) => (
            <span
              key={sub}
              className="border border-rule bg-secondary/40 px-2 py-1 text-[10px] text-muted-foreground"
            >
              {sub}
            </span>
          ))}
        </div>
      </motion.div>
      {index < STAGES.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
          className="h-6 w-px bg-border"
        />
      )}
    </div>
  );
}
