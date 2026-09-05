import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Background on WLCG grid computing, GOCDB, BDII/GLUE2, OSG Topology, normalization and reconciliation.",
      },
    ],
  }),
  component: LearnPage,
});

const SECTIONS = [
  {
    title: "WLCG and grid infrastructure metadata",
    body: [
      "The Worldwide LHC Computing Grid (WLCG) federates computing and storage resources across hundreds of sites on six continents. Coordinating these resources requires authoritative metadata: where a site is, what services it offers, who operates it, and how to contact it.",
      "No single catalogue is perfect. GOCDB, BDII and OSG Topology each describe overlapping sets of sites, but with different schemas, update cadences, and authority models. This is exactly why reconciliation matters.",
    ],
  },
  {
    title: "GOCDB — the EGI site registry",
    body: [
      "The Grid Operations Centre Database (GOCDB) is the canonical registry for EGI sites and services. It exposes a REST/XML API with endpoints such as get_site_list, returning site records with attributes like NAME, COUNTRY_CODE, ROC and GIIS_URL.",
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      </div>
      <div className="space-y-4">
        {SECTIONS.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {section.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
