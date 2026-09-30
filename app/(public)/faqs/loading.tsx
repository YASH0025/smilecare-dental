import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="border-b bg-canvas">
        <div className="container-page space-y-4 py-14">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-2/3 max-w-xl" />
          <Skeleton className="h-5 w-1/2 max-w-lg" />
        </div>
      </div>
      <div className="container-page grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
