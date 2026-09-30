"use client";

import { useSlotsQuery } from "@/lib/query";

/**
 * Availability for a dentist/date/service, backed by TanStack Query
 * (cached per combination, always refetched on mount, cancellable).
 * Returns the shape <SlotPicker> expects.
 */
export function useSlots(params: { dentistId?: string; date?: string; serviceId?: string; excludeId?: string }) {
  const query = useSlotsQuery(params);
  return {
    data: query.data ?? null,
    loading: query.isFetching && !query.data,
    error: query.isError ? query.error.message : null,
    refetch: () => void query.refetch(),
    isRefreshing: query.isFetching && Boolean(query.data),
  };
}
