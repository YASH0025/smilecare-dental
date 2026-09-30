"use client";

import { SmartImage } from "@/components/shared/smart-image";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { BookingDentist } from "./types";

export function StepDentist({ dentists, value, onChange }: { dentists: BookingDentist[]; value: string; onChange: (id: string) => void }) {
  if (!dentists.length) {
    return <EmptyState title="No dentist available" description="No dentist currently offers this treatment online. Please call the clinic to book." />;
  }
  return (
    <div role="radiogroup" aria-label="Dentist" className="grid gap-3 sm:grid-cols-2">
      {dentists.map((d) => {
        const selected = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(d.id)}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
              selected ? "border-primary bg-accent/60 ring-1 ring-primary" : "bg-white hover:border-primary/40",
            )}
          >
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <SmartImage src={d.photo} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{d.name}</span>
              <span className="mt-0.5 block text-xs text-primary">{d.specialization}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {d.qualification} · {d.experienceYears}+ yrs
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
