import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQueryOptions } from "@/lib/queries";
import { ClientOnly } from "@/components/client-only";
import { WorldMap } from "@/components/world-map";
import { InfoTip } from "@/components/info-tip";

export const Route = createFileRoute("/map")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "World Map — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Interactive world map of reconciled WLCG grid sites, coloured by match confidence.",
      },
      { property: "og:title", content: "World Map — WLCG Infrastructure Explorer" },
      {
        property: "og:description",
        content:
          "Interactive world map of reconciled WLCG grid sites, coloured by match confidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { data: snapshot } = useSuspenseQuery(snapshotQueryOptions);
  const withCoords = snapshot.sites.filter(
    (s) => typeof s.latitude === "number" && typeof s.longitude === "number",
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-rule pb-6">
        <p className="label-micro">Geography</p>
        <h1 className="flex items-center gap-3 font-display text-4xl font-black">
          <Globe className="h-8 w-8" /> World map
        </h1>
        <p className="text-sm text-ink-soft">
          {withCoords.length} of {snapshot.sites.length} centres have coordinates.
          Hover a dot to see how the same centre appears in each catalogue.{" "}
          <InfoTip term="coordinates" />
        </p>
      </header>
      <ClientOnly>
        <WorldMap sites={snapshot.sites} />
      </ClientOnly>
    </div>
  );
}
