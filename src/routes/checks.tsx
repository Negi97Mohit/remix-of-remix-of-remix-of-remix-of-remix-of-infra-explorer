import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { validationQueryOptions } from "@/lib/queries";
import { ProviderBadge } from "@/components/provider-badge";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";

const TITLE = "Checks — WLCG Infrastructure Explorer";
const DESC =
  "Post-unification validation: did any record get dropped, counted twice, or merged without evidence?";

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

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">Validation</p>
        <h1 className="font-display text-4xl font-black sm:text-5xl">
          Did the unification work?
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">
          These checks run against the finished snapshot every time the pipeline
          refreshes. They answer the questions that matter: nothing was lost,
          nothing was counted twice, every merge has evidence, and contradictions
          are visible rather than hidden.
        </p>
      </header>

      <section className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Pass", report.passed, "text-emerald-700"],
          ["Warn", report.warned, "text-amber-700"],
          ["Fail", report.failed, "text-rose-700"],
          [
            "Checks",
            report.checks.length,
            "text-foreground",
          ],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-paper p-4">
            <p className="label-micro">{label}</p>
            <p className={cn("font-display text-3xl font-black tabular-nums", color)}>
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="border border-rule bg-paper p-5">
        <h2 className="font-display text-xl font-bold">Totals</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Total label="Input records" value={report.totals.input_records} />
          <Total label="Unified centres" value={report.totals.sites} />
          <Total label="Multi-catalogue centres" value={report.totals.multi_provider_sites} />
          <Total label="Single-source centres" value={report.totals.single_provider_sites} />
          <Total label="Input services" value={report.totals.input_services} />
          <Total label="Unified services" value={report.totals.grouped_services} />
        </div>
        <div className="mt-5 grid gap-px bg-border sm:grid-cols-3">
          {report.totals.by_provider.map((p) => (
            <div key={p.provider} className="bg-secondary/30 p-3">
              <div className="mb-1">
                <ProviderBadge provider={p.provider} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {p.input} read · {p.grouped} unified
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-px bg-border sm:grid-cols-4">
          {report.totals.by_band.map((b) => (
            <div key={b.band} className="bg-secondary/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                {b.band}
              </p>
              <p className="font-display text-2xl font-black tabular-nums">
                {b.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <ShieldCheck className="h-6 w-6" /> Check results
        </h2>
        <div className="grid gap-4">
          {report.checks.map((check) => (
            <CheckCard key={check.id} check={check} />
          ))}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Snapshot built at {report.built_at}. Validation ran in{" "}
        {report.duration_ms} ms. Every check is implemented on the server, so the
        browser only renders the results.
      </p>
    </div>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="label-micro">{label}</p>
      <p className="font-display text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function CheckCard({ check }: { check: import("@/lib/pipeline/validation").ValidationCheck }) {
  const Icon = {
    pass: CheckCircle2,
    warn: AlertTriangle,
    fail: XCircle,
  }[check.status];

  const iconColor = {
    pass: "text-emerald-700",
    warn: "text-amber-700",
    fail: "text-rose-700",
  }[check.status];

  const borderColor = {
    pass: "border-emerald-700/30",
    warn: "border-amber-700/30",
    fail: "border-rose-700/30",
  }[check.status];

  return (
    <div className={cn("border bg-paper p-5", borderColor)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} />
          <div>
            <h3 className="font-display text-lg font-bold">{check.title}</h3>
            <p className="text-sm text-muted-foreground">{check.question}</p>
          </div>
        </div>
        <span
          className={cn(
            "border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
            check.status === "pass"
              ? "border-emerald-700/30 bg-emerald-700/10 text-emerald-700"
              : check.status === "warn"
                ? "border-amber-700/30 bg-amber-700/10 text-amber-700"
                : "border-rose-700/30 bg-rose-700/10 text-rose-700",
          )}
        >
          {check.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{check.summary}</p>

      {check.samples.length > 0 ? (
        <div className="mt-4 border-t border-rule pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {check.count > check.samples.length
              ? `First ${check.samples.length} of ${check.count} rows`
              : `${check.count} rows`}
          </p>
          <ul className="space-y-2">
            {check.samples.map((s, i) => (
              <li key={i} className="text-xs">
                <span className="font-mono font-semibold">{s.label}</span>
                <span className="text-muted-foreground"> — {s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
