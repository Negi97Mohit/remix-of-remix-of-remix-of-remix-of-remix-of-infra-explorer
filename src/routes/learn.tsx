import { createFileRoute } from "@tanstack/react-router";
import { InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Background on WLCG grid computing, GOCDB, BDII/GLUE2, OSG Topology, normalization and reconciliation.",
      },
      { property: "og:title", content: "Learn — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "Background on WLCG grid computing, GOCDB, BDII/GLUE2, OSG Topology, normalization and reconciliation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnPage,
});

const SECTIONS = [
  {
    title: "WLCG and grid infrastructure metadata",
    body: [
      "The Worldwide LHC Computing Grid (WLCG) federates computing and storage resources across hundreds of centres on six continents. Coordinating these resources requires authoritative metadata: where a centre is, what services it offers, who operates it, and how to contact it.",
      "No single catalogue is perfect. GOCDB, BDII and OSG Topology each describe overlapping sets of centres, but with different schemas, update cadences, and authority models. This is exactly why reconciliation matters.",
    ],
  },
  {
    title: "GOCDB — the EGI centre registry",
    body: [
      "The Grid Operations Centre Database (GOCDB) is the canonical registry for EGI sites and services. It exposes a REST/XML API with endpoints such as get_site_list, returning records with attributes like NAME, COUNTRY_CODE, ROC and GIIS_URL.",
      "GOCDB records are administratively authoritative, but they usually lack precise geospatial coordinates and describe services indirectly through the site's GIIS URL.",
    ],
  },
  {
    title: "BDII and the GLUE2 schema",
    body: [
      "The Berkeley Database Information Index (BDII) publishes GLUE2-conformant LDAP entries. Key object classes include GLUE2Domain, GLUE2Location, GLUE2Service, GLUE2Endpoint, GLUE2Policy and GLUE2Extension.",
      "GLUE2 records often contain the richest technical signal: exact latitude and longitude, service IDs, endpoint URLs, implementation names and versions. They are the strongest source for geospatial and endpoint matching.",
    ],
  },
  {
    title: "OSG Topology",
    body: [
      "The Open Science Grid publishes its resource group topology as an XML document. Each ResourceGroup contains a Facility, Site, SupportCenter and a list of Resources, each with FQDNs and service descriptions.",
      "OSG naming conventions differ from EGI, so direct string comparison is not enough. Normalization strips whitespace, case, and punctuation before matching.",
    ],
  },
  {
    title: "Normalization",
    body: [
      "Normalization maps heterogeneous provider schemas onto one canonical model. Every provider record is reduced to the same fields — name, country, coordinates, endpoints, services — while its raw fields are preserved untouched.",
      "The rule is simple: never overwrite provider data. The canonical model only references source records; provenance links every value back to its origin.",
    ],
  },
  {
    title: "Reconciliation",
    body: [
      "Reconciliation groups provider records that describe the same infrastructure. The engine scores evidence: identical normalized identifiers (+40), matching country (+20), shared endpoint host (+25), and agreeing coordinates (+15).",
      "Confidence bands (HIGH ≥70, MEDIUM ≥45, REVIEW <45, SINGLE for one provider) make the match quality explicit. When providers disagree, the engine creates a conflict card rather than silently picking a winner.",
    ],
  },
];

function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">Reference</p>
        <h1 className="font-display text-4xl font-black">
          The ideas behind the{" "}
          <em className="font-normal italic text-accent">explorer</em>
        </h1>
        <p className="text-sm text-ink-soft">
          A short guide to the catalogues, the matching problem, and the terms
          used in this tool.
        </p>
      </header>

      <div className="space-y-6">
        {SECTIONS.map((section, i) => (
          <article key={i} className="border border-rule bg-paper p-5">
            <h2 className="font-display text-xl font-bold">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
              {section.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
