import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Play, Server, Clock, Database } from "lucide-react";
import { validationQueryOptions } from "@/lib/queries";
import { ProviderBadge } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";
import { CRIC_ADAPTER_HEALTH, INGESTION_QUALITY_LOG } from "@/lib/pipeline/cric-demo";

const TITLE = "Quality & Pipeline Audit — CERN CRIC Technical POC";
const DESC =
  "Operational integrity, data quality sanitization log, adapter health and pipeline validation for WLCG multi-source federation.";

export const Route = createFileRoute("/checks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(validationQueryOptions),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChecksPage,
});

function ChecksPage() {
  const { data: report } = useSuspenseQuery(validationQueryOptions);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("2026-09-05 08:05:00 UTC");

  function triggerPipelineRun() {
    setIsRunning(true);
    setPipelineStep("1/4 Ingesting live feeds from GOCDB REST and BDII LDAP...");
    setTimeout(() => {
      setPipelineStep("2/4 Validating schemas & sanitizing whitespace anomalies...");
      setTimeout(() => {
        setPipelineStep("3/4 Calculating SiteMatcher evidence weights (+85 verified)...");
        setTimeout(() => {
          setPipelineStep("4/4 Generating ReconciledSite canonical snapshot & audit logs...");
          setTimeout(() => {
            setIsRunning(false);
            setPipelineStep("");
            setLastRefreshed(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2 border-b border-rule pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
          Data Integrity & Ingestion Operations
        </div>
        <h1 className="font-display text-4xl font-black sm:text-5xl text-foreground">
          Quality & Pipeline <em className="font-normal italic text-accent">Audit</em>
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Real distributed infrastructure data is never perfectly clean. This audit view demonstrates proactive
          sanitization (such as GOCDB Record #42 whitespace handling), adapter collector health, and formal invariant
          validation across the catalogue.
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE PIPELINE RUN CONTROL & ADAPTER STATUS                      */}
      {/* ========================================================================= */}
      <section className="p-5 border border-rule bg-card rounded space-y-4 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <RefreshCw className={cn("h-4 w-4 text-accent", isRunning && "animate-spin")} />
              Multi-Source Pipeline Orchestrator
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulates automated ingestion, data quality validation, and explainable reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded border border-accent/20 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                {pipelineStep}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last verified: <span className="font-mono font-semibold text-foreground">{lastRefreshed}</span>
              </div>
            )}
            <button
              onClick={triggerPipelineRun}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              {isRunning ? "Executing..." : "Trigger Pipeline Run"}
            </button>
          </div>
        </div>

        {/* Adapters Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {CRIC_ADAPTER_HEALTH.map((adapter) => (
            <div key={adapter.provider} className="p-3.5 border border-rule bg-background rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                  {adapter.label}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {adapter.status.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground truncate">
                {adapter.endpoint}
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-rule/60">
                <span className="text-muted-foreground">Ingested:</span>
                <span className="font-mono font-bold text-foreground">
                  {adapter.record_count} records ({adapter.latency_ms}ms)
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground bg-card p-2 rounded border border-rule/40">
                {adapter.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INGESTION DATA QUALITY & SANITIZATION AUDIT LOG                         */}
      {/* ========================================================================= */}
      <section className="border border-rule bg-card rounded overflow-hidden">
        <div className="p-4 border-b border-rule bg-secondary/30">
          <h2 className="font-display text-lg font-bold text-foreground">
            Ingestion Data Quality &amp; Sanitization Log
          </h2>
          <p className="text-xs text-muted-foreground">
            Real production anomalies caught and sanitized during collector execution without dropping sites.
          </p>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <tr>
              <th className="p-3 border-b border-rule">Catalogue</th>
              <th className="p-3 border-b border-rule">Target Record</th>
              <th className="p-3 border-b border-rule">Issue Category</th>
              <th className="p-3 border-b border-rule">Observed Infrastructure Anomaly</th>
              <th className="p-3 border-b border-rule">Pipeline Remediation</th>
              <th className="p-3 border-b border-rule text-right">Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {INGESTION_QUALITY_LOG.map((log) => (
              <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                <td className="p-3 font-mono font-bold text-foreground">{log.source}</td>
                <td className="p-3 font-mono text-accent">{log.recordId}</td>
                <td className="p-3 font-semibold text-foreground">{log.issueType}</td>
                <td className="p-3 text-muted-foreground">{log.description}</td>
                <td className="p-3 text-foreground font-medium">{log.actionTaken}</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ========================================================================= */}
      {/* 3. POST-UNIFICATION INTEGRITY CHECKS                                      */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-rule pb-2">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Formal Invariant Checks
            </h2>
            <p className="text-xs text-muted-foreground">
              Guarantees zero record loss, uniqueness, and auditable evidence.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-mono text-xs font-bold">
              {report.passed} PASSED
            </span>
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-mono text-xs font-bold">
              {report.warned} WARNINGS
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {report.checks.map((check) => {
            const isPass = check.status === "pass";
            const isWarn = check.status === "warn";
            return (
              <div
                key={check.id}
                className={cn(
                  "border p-4 rounded bg-card flex items-start gap-3",
                  isPass ? "border-rule" : isWarn ? "border-amber-400/50 bg-amber-50/20" : "border-rose-400/50 bg-rose-50/20"
                )}
              >
                <div className="mt-0.5">
                  {isPass ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : isWarn ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  )}
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground text-sm">{check.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{check.id}</span>
                  </div>
                  <p className="text-muted-foreground">{check.description}</p>
                  {check.detail && (
                    <div className="mt-2 p-2 bg-background rounded font-mono text-[11px] text-foreground border border-rule/50">
                      {check.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
