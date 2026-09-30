import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Loading placeholders used by <RenderContent>. Shapes mirror the real layouts to avoid jumps. */

export function BlockSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 rounded-xl border bg-white p-5", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

export function TableSkeleton({ rows = 8, columns = 6, toolbar = true }: { rows?: number; columns?: number; toolbar?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)]">
      {toolbar && (
        <div className="flex gap-3 border-b p-4">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </div>
      )}
      <div className="flex gap-4 border-b bg-canvas px-5 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b px-5 py-4 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 1 && "flex-[1.6]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6, className = "md:grid-cols-2 2xl:grid-cols-3", media = false }: { count?: number; className?: string; media?: boolean }) {
  return (
    <div className={cn("grid gap-5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-white">
          {media && <Skeleton className="aspect-[4/3] rounded-none" />}
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 6, className = "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className="mt-6 flex items-end gap-3" style={{ height }}>
        {[40, 65, 50, 80, 55, 90].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <TableSkeleton rows={6} columns={4} toolbar={false} />
        <BlockSkeleton />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border bg-white p-5">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-full max-w-3xl" />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <StatCardsSkeleton count={4} className="sm:grid-cols-2 lg:grid-cols-4" />
          <BlockSkeleton />
          <BlockSkeleton />
        </div>
        <BlockSkeleton />
      </div>
    </div>
  );
}

export function FormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[62px] w-full rounded-xl" />
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4 flex justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-72" />
        </div>
        <Skeleton className="h-[560px] w-full" />
      </div>
    </div>
  );
}
