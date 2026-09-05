import { createFileRoute } from "@tanstack/react-router";
import { Layers, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "What the WLCG Infrastructure Explorer is, how it works, and where its live data comes from.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">About</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A technical proof-of-concept, not a replacement for CRIC.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What this project is</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            WLCG Infrastructure Explorer demonstrates how live infrastructure
            metadata from multiple heterogeneous providers can be collected,
            normalized, validated, reconciled, and traced through provenance —
            all inside a single engineering-style interface.
          </p>
          <p>
            It is <strong className="text-foreground">CRIC-inspired</strong>,
            but it is not a recreation or replacement of CERN's CRIC
            (Computing Resource Information Catalogue). Its purpose is to show,
            during a technical conversation, how independent information systems
            describe the same grid site and how a reconciliation engine can
            decide whether they refer to the same physical infrastructure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live and snapshot data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">GOCDB</strong> and{" "}
            <strong className="text-foreground">OSG Topology</strong> are read
            live over HTTPS each time the pipeline refreshes.
          </p>
          <p>
            <strong className="text-foreground">BDII</strong> uses a captured
            GLUE2 snapshot because the live top-BDII endpoint is an LDAP server
            on port 2170, which the serverless edge runtime cannot reach. The
            snapshot adapter uses the same normalization, validation, and
            provenance pipeline as the live providers.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>
              GOCDB —{" "}
              <a
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
                href="https://goc.egi.eu/gocdbpi/public/?method=get_site_list"
                target="_blank"
                rel="noopener noreferrer"
              >
                get_site_list <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              OSG Topology —{" "}
              <a
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
                href="https://topology.opensciencegrid.org/rgsummary/xml"
                target="_blank"
                rel="noopener noreferrer"
              >
                rgsummary/xml <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              BDII snapshot — captured from{" "}
              <span className="font-mono text-xs">ldap://sbdii.ui.savba.sk:2170/o=glue</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technology stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <StackItem name="React 19" tag="UI" />
            <StackItem name="TanStack Start" tag="framework" />
            <StackItem name="TanStack Query" tag="data" />
            <StackItem name="Tailwind CSS" tag="styling" />
            <StackItem name="Vite 7" tag="build" />
            <StackItem name="Framer Motion" tag="motion" />
            <StackItem name="react-simple-maps" tag="map" />
            <StackItem name="Recharts" tag="charts" />
            <StackItem name="Python FastAPI" tag="external backend" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StackItem({ name, tag }: { name: string; tag: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{tag}</div>
    </div>
  );
}
