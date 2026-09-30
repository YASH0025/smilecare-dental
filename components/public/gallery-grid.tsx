"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { GalleryItem } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GalleryGrid({ items, filterable = true, limit }: { items: GalleryItem[]; filterable?: boolean; limit?: number }) {
  const [category, setCategory] = React.useState<string>("ALL");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const categories = React.useMemo(() => ["ALL", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const visible = items.filter((i) => category === "ALL" || i.category === category).slice(0, limit ?? items.length);
  const current = openIndex !== null ? visible[openIndex] : null;

  const step = (dir: 1 | -1) => setOpenIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length));

  return (
    <div>
      {filterable && (
        <div role="tablist" aria-label="Filter gallery" className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
                category === c ? "border-primary bg-primary text-white" : "bg-white text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "ALL" ? "All" : GALLERY_CATEGORY_LABELS[c as keyof typeof GALLERY_CATEGORY_LABELS]}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {visible.map((item, index) => (
          <li key={item.id}>
            <button
              onClick={() => setOpenIndex(index)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted text-left focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              aria-label={`Open image: ${item.title}`}
            >
              <SmartImage src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 400px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#0b1b34]/65 to-transparent p-3 pt-10 text-sm font-medium text-white opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                {item.title}
                <Expand className="size-4" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
          {current && (
            <>
              <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-[16/10]">
                <SmartImage src={current.image} alt={current.title} fill sizes="(min-width: 1024px) 900px, 100vw" className="object-contain" />
              </div>
              <div className="flex items-center justify-between gap-4 border-t p-4">
                <div>
                  <DialogTitle className="text-base">{current.title}</DialogTitle>
                  <DialogDescription>{GALLERY_CATEGORY_LABELS[current.category]}</DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon-sm" onClick={() => step(-1)} aria-label="Previous image">
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => step(1)} aria-label="Next image">
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
