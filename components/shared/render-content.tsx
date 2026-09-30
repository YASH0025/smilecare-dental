"use client";

import * as React from "react";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import type { QueryLike } from "@/lib/query/combine";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { BlockSkeleton } from "./skeletons";

/**
 * Renders the right UI for a query's lifecycle so every screen handles
 * loading, error, empty and background-refresh states the same way.
 *
 * <RenderContent query={appointmentsQuery} loading={<TableSkeleton />} isEmpty={(d) => !d.length} empty={<EmptyState … />}>
 *   {(appointments) => <AppointmentTable rows={appointments} />}
 * </RenderContent>
 */
export function RenderContent<T>({
  query,
  children,
  loading,
  empty,
  isEmpty,
  errorTitle = "Couldn't load this data",
  showRefreshing = false,
  className,
}: {
  query: QueryLike<T>;
  children: (data: T) => React.ReactNode;
  /** Shown on first load (no cached data yet). Defaults to a generic skeleton. */
  loading?: React.ReactNode;
  /** Shown when `isEmpty(data)` is true. */
  empty?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  errorTitle?: string;
  /** Show a subtle "Updating…" badge during background refetches (e.g. filter/range changes). */
  showRefreshing?: boolean;
  className?: string;
}) {
  if (query.isPending) {
    return (
      <div aria-busy="true" aria-live="polite" className={className}>
        <span className="sr-only">Loading…</span>
        {loading ?? <BlockSkeleton />}
      </div>
    );
  }

  if (query.isError || query.data === undefined) {
    return <QueryError title={errorTitle} error={query.error} onRetry={query.refetch} retrying={query.isFetching} className={className} />;
  }

  if (isEmpty?.(query.data) && empty !== undefined) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={cn("relative", className)} aria-busy={query.isFetching || undefined}>
      {showRefreshing && query.isFetching && (
        <span className="absolute -top-2 right-0 z-10 inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
          <Loader2 className="size-3 animate-spin" aria-hidden /> Updating…
        </span>
      )}
      {children(query.data)}
    </div>
  );
}

export function QueryError({
  title,
  error,
  onRetry,
  retrying,
  className,
}: {
  title: string;
  error: Error | null;
  onRetry: () => unknown;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-xl border border-destructive/20 bg-white px-6 py-12 text-center", className)}>
      <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{error ? errorMessage(error) : "Something went wrong."}</p>
      <Button variant="outline" className="mt-5" onClick={() => onRetry()} disabled={retrying}>
        {retrying ? <Loader2 className="animate-spin" /> : <RotateCcw />}
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
