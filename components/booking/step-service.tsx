"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { BookingService } from "./types";

export function StepService({ services, value, onChange }: { services: BookingService[]; value: string; onChange: (id: string) => void }) {
  const [q, setQ] = React.useState("");
  const filtered = services.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search treatments" className="pl-9" aria-label="Search treatments" />
      </div>
      <div role="radiogroup" aria-label="Treatment" className="grid gap-3 sm:grid-cols-2">
        {filtered.map((s) => {
          const selected = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(s.id)}
              className={cn(
                "flex flex-col rounded-lg border p-4 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
                selected ? "border-primary bg-accent/60 ring-1 ring-primary" : "bg-white hover:border-primary/40",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-medium">{s.name}</span>
                <span
                  className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", selected && "border-primary bg-primary")}
                  aria-hidden
                >
                  {selected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
              </span>
              <span className="mt-1 text-xs text-muted-foreground">{s.category}</span>
              <span className="mt-3 flex gap-3 text-xs">
                <span className="text-muted-foreground">{s.duration} min</span>
                <span className="font-medium">From {formatCurrency(s.price)}</span>
              </span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No treatments match “{q}”.</p>}
    </div>
  );
}
