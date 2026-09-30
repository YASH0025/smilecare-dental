"use client";

import * as React from "react";
import { ChevronsLeftRight } from "lucide-react";
import type { PortfolioItem } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";

/** Draggable before/after comparison. Keyboard accessible via the range input. */
export function CompareSlider({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos] = React.useState(50);
  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden rounded-lg bg-muted">
      <SmartImage src={after} alt={`${alt} — after`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <SmartImage src={before} alt={`${alt} — before`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
      </div>
      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium shadow-sm">Before</span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">After</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(11,27,52,0.08)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-white text-foreground shadow-md">
          <ChevronsLeftRight className="size-4" aria-hidden />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare before and after for ${alt}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function BeforeAfterGallery({
  items,
  dentistNames,
  limit,
}: {
  items: PortfolioItem[];
  dentistNames: Record<string, string>;
  limit?: number;
}) {
  const categories = React.useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [active, setActive] = React.useState("All");
  const visible = items.filter((i) => active === "All" || i.category === active).slice(0, limit ?? items.length);

  return (
    <div>
      <div role="tablist" aria-label="Filter cases by category" className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
              active === c ? "border-primary bg-primary text-white" : "bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-3 shadow-[var(--shadow-soft)]">
            <CompareSlider before={item.beforeImage} after={item.afterImage} alt={item.title} />
            <div className="flex items-start justify-between gap-4 px-2 pt-4 pb-2">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.treatment} · {dentistNames[item.dentistId] ?? "SmileCare team"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-medium text-teal">{item.duration}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
