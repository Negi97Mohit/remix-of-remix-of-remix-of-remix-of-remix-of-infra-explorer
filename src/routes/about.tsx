import { createFileRoute } from "@tanstack/react-router";
import { Layers, ExternalLink } from "lucide-react";
import { InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "What the WLCG Infrastructure Explorer is, how it works, and where its live data comes from.",
      },
      { property: "og:title", content: "About — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "What the WLCG Infrastructure Explorer is, how it works, and where its live data comes from.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">About</p>
        <h1 className="flex items-center gap-3 font-display text-4xl font-black">
          <Layers className="h-8 w-8" /> What this is
        </h1>
        <p className="text-sm text-ink-soft">
          A technical proof-of-concept, not a replacement for CRIC.
        </p>
      </header>

      <article className="border border-rule bg-paper p-6">
        <h2 className="font-display text-xl font-bold">Why it exists</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            WLCG Infrastructure Explorer demonstrates how live infrastructure
            metadata from multiple heterogeneous providers can be collected,
            normalized, validated, reconciled, and traced through provenance — all
            inside a single engineering-style interface.
          </p>
          <p>
            It is <strong className="text-foreground">CRIC-inspired</strong>, but
            it is not a recreation or replacement of CERN's CRIC (Computing
            Resource Information Catalogue). Its purpose is to show, during a
            technical conversation, how independent information systems describe
            the same grid centre and how a reconciliation engine can decide whether
            they refer to the same physical infrastructure.
          </p>
        </div>
      </article>

      <article className="border border-rule bg-paper p-6">
        <h2 className="font-display text-xl font-bold">Live and snapshot data</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            <strong className="text-foreground">GOCDB</strong> and{" "}
            <strong className="text-foreground">OSG Topology</strong> are read
            live over HTTPS each time the pipeline refreshes.
          </p>
          <p>
            <strong className="text-foreground">BDII</strong> uses a captured
            GLUE2 snapshot because the live top-BDII endpoint is an LDAP server on
            port 2170, which the serverless edge runtime cannot reach. The snapshot
            adapter uses the same normalization, validation, and provenance pipeline
            as the live providers.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>
              GOCDB —{" "}
              <a
                className="inline-flex items-center gap-0.5 text-accent hover:underline"
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
                className="inline-flex items-center gap-0.5 text-accent hover:underline"
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
        </div>
      </article>

      <article className="border border-rule bg-paper p-6">
        <h2 className="font-display text-xl font-bold">Technology stack</h2>
        <div className="mt-3 grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
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
      </article>
    </div>
  );
}

function StackItem({ name, tag }: { name: string; tag: string }) {
  return (
    <div className="bg-paper p-3">
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {tag}
      </div>
    </div>
  );
}
