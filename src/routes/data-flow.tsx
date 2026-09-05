import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/data-flow")({
  head: () => ({
    meta: [
      { title: "Data Flow — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Pipeline architecture: GOCDB, BDII and OSG are ingested live, normalized, validated, reconciled and exposed via the API.",
      },
    ],
  }),
  component: DataFlowPage,
});

const STAGES = [
  { id: "ingest", label: "Ingest", subs: ["GOCDB REST/XML", "BDII LDAP/GLUE2", "OSG XML"] },
  { id: "adapters", label: "Adapters", subs: ["XML parser", "LDAP/GLUE2 reader", "Record mapping"] },
  { id: "normalize", label: "Normalize", subs: ["Common schema", "Quality checks", "Raw fields kept"] },
  { id: "validate", label: "Validate", subs: ["Missing fields", "Format checks", "Whitespace warnings"] },
  { id: "reconcile", label: "Reconcile", subs: ["Evidence scoring", "Confidence bands", "Conflict detection"] },
  { id: "canonical", label: "Canonical Dataset", subs: ["Merged site records", "Provenance links"] },
  { id: "api", label: "FastAPI / Server", subs: ["REST endpoints", "JSON responses"] },
  { id: "ui", label: "React UI", subs: ["Dashboard", "Map", "Site detail"] },
];

function DataFlowPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Workflow className="h-6 w-6" /> Data Flow
        </h1>
        <p className="text-sm text-muted-foreground">
          From live provider endpoints to the reconciled canonical dataset.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {STAGES.map((stage, index) => (
              <StageNode key={stage.id} stage={stage} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provider diversity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              GOCDB, BDII and OSG Topology describe the same physical sites in
              different formats. The adapter layer decouples parsing from
              semantics so each source can evolve independently.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provenance by design</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Every canonical field stores a provenance trail: which provider,
              which source ID, which native field, and when it was retrieved.
              Nothing is silently overwritten.
            </p>
          </CardContent>
        </Card>
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
        transition={{ delay: index * 0.12, duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border/60 bg-secondary/40 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <span className="font-semibold">{stage.label}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.subs.map((sub) => (
            <span
              key={sub}
              className="rounded-md border border-border/60 bg-background px-2 py-1 text-[10px] text-muted-foreground"
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
          transition={{ delay: index * 0.12 + 0.2, duration: 0.3 }}
          className="h-6 w-px bg-border"
        />
      )}
    </div>
  );
}
