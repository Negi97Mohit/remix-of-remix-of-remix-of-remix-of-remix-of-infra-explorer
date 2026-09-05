import { createFileRoute, Link } from "@tanstack/react-router";
import { GLOSSARY, InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guide — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "What this explorer does, how three infrastructure catalogues are unified into one view, and what every term on screen means.",
      },
      { property: "og:title", content: "Guide — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "Plain-language guide to unifying GOCDB, BDII and OSG site metadata: providers, evidence, confidence, provenance and conflicts.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

const STEPS = [
  {
    n: "01",
    title: "Collect",
    body: "Three catalogues are read live: GOCDB over REST/XML, BDII over LDAP as GLUE2 records, and OSG Topology as XML. Each response is kept exactly as published.",
  },
  {
    n: "02",
    title: "Normalize",
    body: "Every record is rewritten into one shared shape — name, country, coordinates, endpoints, services — while the original fields stay untouched alongside it.",
  },
  {
    n: "03",
    title: "Match",
    body: "Records are compared for evidence: the same normalized name, the same country, a shared server address, coordinates that agree. Each signal is worth points.",
  },
  {
    n: "04",
    title: "Unify",
    body: "Matched records become one unified site with a confidence band. Where catalogues disagree, the disagreement is shown as a conflict instead of being overwritten.",
  },
  {
    n: "05",
    title: "Trace",
    body: "Every unified value keeps its trail: which catalogue, which field, and when it was retrieved. Nothing in the unified view is unattributed.",
  },
];

const PAGES = [
  {
    to: "/" as const,
    name: "Dashboard",
    body: "How many sites exist, how many are described by more than one catalogue, and whether each source is currently answering.",
  },
  {
    to: "/map" as const,
    name: "Map",
    body: "Every site with known coordinates. Hover a dot to see which catalogues describe it side-by-side; click to open the full comparison.",
  },
  {
    to: "/sites" as const,
    name: "Sites",
    body: "Searchable list of all unified sites, filterable by how confident the match is.",
  },
  {
    to: "/reconciliation" as const,
    name: "Reconciliation",
    body: "Only the sites described by two or more catalogues, with the evidence that tied them together.",
  },
  {
    to: "/data-flow" as const,
    name: "Data Flow",
    body: "The pipeline itself, from raw responses to the unified record.",
  },
];

function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <header className="space-y-4 border-b border-rule pb-8">
        <p className="label-micro">Guide</p>
        <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-5xl">
          The same computing centre,{" "}
          <em className="font-normal italic text-accent">described three ways</em>
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Large scientific computing is spread across hundreds of centres in
          different countries, and each region keeps its own catalogue of them.
          The catalogues overlap: the same centre appears in two or three of
          them, under different names, with different spellings, and sometimes
          with contradictory details. There is no single list you can trust.
        </p>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          This explorer builds that single list. It reads the catalogues live,
          works out which entries describe the same place, and shows them next to
          each other with the reasoning in the open — so a unified view can be
          checked rather than taken on faith. Nothing is ever overwritten or
          quietly merged.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold">
          Every acronym on this site, in plain words
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          This field uses a lot of short names. Here is what each one stands for
          and why it appears here.
        </p>
        <dl className="divide-y divide-border border-y border-border">
          {ACRONYMS.map(([short, long, why]) => (
            <div key={short} className="grid gap-1 py-4 sm:grid-cols-[220px_1fr]">
              <dt className="space-y-0.5">
                <span className="block font-mono text-sm font-semibold text-accent">
                  {short}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {long}
                </span>
              </dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{why}</dd>
            </div>
          ))}
        </dl>
      </section>


      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold">How it works</h2>
        <ol className="divide-y divide-border border-y border-border">
          {STEPS.map((s) => (
            <li key={s.n} className="grid gap-3 py-5 sm:grid-cols-[60px_1fr]">
              <span className="font-mono text-xs font-medium text-accent">
                {s.n}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold">Reading a match</h2>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {[
            ["High", "70 points or more of agreeing evidence. Safe to treat as one site."],
            ["Medium", "45 points or more. Likely the same site, worth a glance."],
            ["Review", "Below 45 points. A human should decide."],
            ["Single", "Only one catalogue knows this site. Nothing to compare yet."],
          ].map(([band, text]) => (
            <div key={band} className="bg-paper p-5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {band}
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold">Where to look</h2>
        <ul className="divide-y divide-border border-y border-border">
          {PAGES.map((p) => (
            <li key={p.name}>
              <Link
                to={p.to}
                className="group grid gap-2 py-4 sm:grid-cols-[180px_1fr]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] group-hover:text-accent">
                  {p.name}
                </span>
                <span className="text-sm leading-relaxed text-ink-soft">
                  {p.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold">Glossary</h2>
        <p className="text-sm text-muted-foreground">
          These terms appear across the app. Anywhere you see{" "}
          <InfoTip term="evidence" />, the same explanation is one hover away.
        </p>
        <dl className="divide-y divide-border border-y border-border">
          {Object.entries(GLOSSARY).map(([term, text]) => (
            <div key={term} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {term}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
