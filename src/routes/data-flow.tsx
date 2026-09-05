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
