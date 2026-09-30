import type { Stat } from "@/types";
import { cn } from "@/lib/utils";

export function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section aria-label="Clinic at a glance" className="border-y bg-white">
      <dl className="container-page grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "flex flex-col-reverse px-2 py-8 text-center sm:py-10",
              i % 2 === 0 && "border-r",
              i < 2 && "border-b lg:border-b-0",
              "lg:border-r lg:last:border-r-0",
            )}
          >
            <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
            <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
