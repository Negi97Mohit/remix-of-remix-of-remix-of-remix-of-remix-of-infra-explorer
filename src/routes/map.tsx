import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotQueryOptions } from "@/lib/queries";
import { ClientOnly } from "@/components/client-only";
import { WorldMap } from "@/components/world-map";

export const Route = createFileRoute("/map")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(snapshotQueryOptions),
  head: () => ({
    meta: [
      { title: "World Map — WLCG Infrastructure Explorer" },
      {
        name: "description",
        content:
          "Interactive world map of reconciled WLCG grid sites, colored by match confidence.",
      },
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
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Globe className="h-6 w-6" /> World Map
        </h1>
        <p className="text-sm text-muted-foreground">
          {withCoords.length} of {snapshot.sites.length} reconciled sites have
          coordinates. Pan and zoom to explore.
        </p>
      </div>
      <ClientOnly>
        <WorldMap sites={snapshot.sites} />
      </ClientOnly>
    </div>
  );
}
