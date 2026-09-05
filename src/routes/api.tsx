import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "API — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "API documentation for the WLCG Infrastructure Explorer: endpoints, example requests and example responses.",
      },
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Code2 className="h-6 w-6" /> API Reference
        </h1>
        <p className="text-sm text-muted-foreground">
          Backend base URL: <span className="font-mono text-foreground">http://localhost:8000</span>
        </p>
      </div>

      <div className="space-y-4">
        {ENDPOINTS.map((ep) => (
          <Card key={ep.path}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                  {ep.method}
                </span>
                <CardTitle className="text-base font-mono">{ep.path}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{ep.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Example request
                </div>
                <pre className="overflow-x-auto rounded bg-secondary/50 p-2 text-xs font-mono">
                  {ep.example}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Example response
                </div>
                <pre className="overflow-x-auto rounded bg-secondary/50 p-2 text-xs font-mono">
                  {ep.response}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
