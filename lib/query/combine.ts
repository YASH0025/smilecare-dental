import type { UseQueryResult } from "@tanstack/react-query";

/** The subset of a query result that RenderContent needs. */
export interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => unknown;
}

type DataOf<Q> = Q extends UseQueryResult<infer D, unknown> ? D : Q extends QueryLike<infer D> ? D : never;

/**
 * Combine several queries into one QueryLike whose data is a tuple.
 * Pending if any is pending, errored if any errored; retry refetches the failed ones.
 */
export function combineQueries<const Q extends readonly QueryLike<unknown>[]>(...queries: Q): QueryLike<{ [K in keyof Q]: DataOf<Q[K]> }> {
  const isPending = queries.some((q) => q.isPending);
  const failed = queries.filter((q) => q.isError);
  return {
    data: isPending || failed.length ? undefined : (queries.map((q) => q.data) as { [K in keyof Q]: DataOf<Q[K]> }),
    isPending,
    isError: failed.length > 0,
    error: failed[0]?.error ?? null,
    isFetching: queries.some((q) => q.isFetching),
    refetch: () => Promise.all((failed.length ? failed : queries).map((q) => q.refetch())),
  };
}
