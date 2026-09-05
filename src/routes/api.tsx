import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "API — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "API documentation for the WLCG Infrastructure Explorer: endpoints, example requests and example responses.",
      },
      { property: "og:title", content: "API — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "API documentation for the WLCG Infrastructure Explorer: endpoints, example requests and example responses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApiPage,
});

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/providers",
    summary: "Provider health, protocol, status, record count and last retrieval time.",
    example: `curl http://localhost:8000/api/providers`,
    response: `[
  {
    "provider": "gocdb",
    "label": "GOCDB",
    "protocol": "REST/XML",
    "status": "healthy",
    "record_count": 828,
    "last_retrieved": "2026-09-05T04:00:00Z"
  }
]`,
  },
  {
    method: "POST",
    path: "/api/refresh",
    summary: "Trigger a live refresh of all configured providers.",
    example: `curl -X POST http://localhost:8000/api/refresh`,
    response: `{ "refreshed": true, "built_at": "2026-09-05T04:01:00Z" }`,
  },
  {
    method: "GET",
    path: "/api/sites",
    summary: "List reconciled canonical sites. Supports search, filters and pagination.",
    example: `curl "http://localhost:8000/api/sites?search=iisas&confidence=HIGH"`,
    response: `{
  "total": 124,
  "page": 1,
  "page_size": 50,
  "items": [
    {
      "canonical_id": "site:iisas-bratislava",
      "name": "IISAS-Bratislava",
      "country": "Slovakia",
      "score": 85,
      "confidence": "HIGH"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/sites/{canonical_id}",
    summary: "Full canonical site with participating provider records, evidence, provenance and conflicts.",
    example: `curl http://localhost:8000/api/sites/site:iisas-bratislava`,
    response: `{
  "canonical_id": "site:iisas-bratislava",
  "name": "IISAS-Bratislava",
  "score": 85,
  "confidence": "HIGH",
  "evidence": [
    { "signal": "Domain identifier matched", "points": 40 }
  ],
  "records": [ ... ]
}`,
  },
  {
    method: "GET",
    path: "/api/providers/gocdb",
    summary: "Normalized GOCDB records as ingested by the adapter.",
    example: `curl http://localhost:8000/api/providers/gocdb`,
    response: `{ "provider": "gocdb", "count": 828, "records": [ ... ] }`,
  },
  {
    method: "GET",
    path: "/api/providers/bdii",
    summary: "Normalized BDII/GLUE2 records.",
    example: `curl http://localhost:8000/api/providers/bdii`,
    response: `{ "provider": "bdii", "count": 28, "records": [ ... ] }`,
  },
  {
    method: "GET",
    path: "/api/providers/osg",
    summary: "Normalized OSG Topology resource groups.",
    example: `curl http://localhost:8000/api/providers/osg`,
    response: `{ "provider": "osg", "count": 412, "records": [ ... ] }`,
  },
  {
    method: "GET",
    path: "/api/reconciliation/{canonical_id}",
    summary: "Detailed reconciliation evidence and confidence breakdown for one site.",
    example: `curl http://localhost:8000/api/reconciliation/site:iisas-bratislava`,
    response: `{
  "evidence": [ ... ],
  "confidence": "HIGH",
  "matched_provider_ids": ["gocdb:41", "bdii:IISAS-Bratislava"]
}`,
  },
  {
    method: "GET",
    path: "/api/map",
    summary: "Map-ready coordinates for every site with known latitude and longitude.",
    example: `curl http://localhost:8000/api/map`,
    response: `[
  {
    "canonical_id": "site:iisas-bratislava",
    "latitude": 48.171,
    "longitude": 17.070,
    "provider": "bdii",
    "name": "IISAS-Bratislava"
  }
]`,
  },
];

function ApiPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">API</p>
        <h1 className="flex items-center gap-3 font-display text-4xl font-black">
          <Code2 className="h-8 w-8" /> Reference
        </h1>
        <p className="text-sm text-ink-soft">
          Backend base URL: <span className="font-mono">http://localhost:8000</span>
          <InfoTip term="api" className="ml-1" />
        </p>
      </header>

      <div className="space-y-5">
        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="border border-rule bg-paper">
            <div className="border-b border-rule p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                  {ep.method}
                </span>
                <h2 className="font-mono text-base font-semibold">{ep.path}</h2>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{ep.summary}</p>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div>
                <div className="mb-1 label-micro">Example request</div>
                <pre className="overflow-x-auto border border-rule bg-secondary/30 p-3 text-[10.5px] font-mono">
                  {ep.example}
                </pre>
              </div>
              <div>
                <div className="mb-1 label-micro">Example response</div>
                <pre className="overflow-x-auto border border-rule bg-secondary/30 p-3 text-[10.5px] font-mono">
                  {ep.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
