import { queryOptions } from "@tanstack/react-query";
import {
  getSnapshot,
  getSite,
  getProviders,
  getValidation,
  getRecords,
} from "@/lib/pipeline.functions";

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

export const validationQueryOptions = queryOptions({
  queryKey: ["wlcg", "validation"],
  queryFn: () => getValidation(),
});

export const recordsQueryOptions = (params: {
  query?: string;
  provider?: "gocdb" | "bdii" | "osg" | "all";
  limit?: number;
  offset?: number;
}) =>
  queryOptions({
    queryKey: ["wlcg", "records", params],
    queryFn: () => getRecords({ data: params }),
  });
