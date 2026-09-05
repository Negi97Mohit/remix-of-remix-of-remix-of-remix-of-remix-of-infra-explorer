import { queryOptions } from "@tanstack/react-query";
import { getSnapshot, getSite, getProviders } from "@/lib/pipeline.functions";

export const snapshotQueryOptions = queryOptions({
  queryKey: ["wlcg", "snapshot"],
  queryFn: () => getSnapshot(),
});

export const providersQueryOptions = queryOptions({
  queryKey: ["wlcg", "providers"],
  queryFn: () => getProviders(),
});

export const siteQueryOptions = (canonicalId: string) =>
  queryOptions({
    queryKey: ["wlcg", "site", canonicalId],
    queryFn: () => getSite({ data: { canonical_id: canonicalId } }),
  });
