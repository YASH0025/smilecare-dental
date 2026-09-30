"use client";

import * as React from "react";
import { CalendarOff, Clock } from "lucide-react";
import type { TimeSlot } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatTime } from "@/lib/utils";
import type { SlotsResponse } from "./types";

const periods = [
  { label: "Morning", test: (t: string) => t < "12:00" },
  { label: "Afternoon", test: (t: string) => t >= "12:00" && t < "16:00" },
  { label: "Evening", test: (t: string) => t >= "16:00" },
];

/**
 * Slot grid shared by public booking and admin rescheduling.
 * Booked / past slots are rendered but disabled, so patients see the day's shape.
 */
export function SlotPicker({
  data,
  loading,
  error,
  value,
  onChange,
  emptyAction,
}: {
  data: SlotsResponse | null;
  loading: boolean;
  error?: string | null;
  value?: string;
  onChange: (time: string) => void;
  emptyAction?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading available time slots…</span>
        {[0, 1].map((g) => (
          <div key={g}>
            <Skeleton className="mb-3 h-4 w-24" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={CalendarOff} title="Couldn't load time slots" description={error} action={emptyAction} />;
  }

  if (!data) return null;

  if (data.onLeave || !data.working || data.slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarOff}
        title={data.onLeave ? "Dentist unavailable on this date" : !data.working ? "Clinic closed for this dentist" : "No slots on this date"}
        description={data.onLeave ? `${data.leaveReason ?? "On leave"}. Please choose another date.` : "Please choose another date to see available times."}
        action={emptyAction}
      />
    );
  }

  const available = data.slots.filter((s) => s.available).length;

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        <Clock className="size-4" aria-hidden />
        {available > 0 ? `${available} slot${available === 1 ? "" : "s"} available · ${data.duration} min appointment` : "Fully booked on this date"}
      </p>
      {periods.map((p) => {
        const slots = data.slots.filter((s) => p.test(s.time));
        if (!slots.length) return null;
        return (
          <fieldset key={p.label}>
            <legend className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{p.label}</legend>
            <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <SlotButton key={s.time} slot={s} selected={value === s.time} onSelect={() => onChange(s.time)} />
              ))}
            </div>
          </fieldset>
        );
      })}
      <div className="flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border bg-white" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-muted" /> Booked / unavailable
        </span>
      </div>
    </div>
  );
}

function SlotButton({ slot, selected, onSelect }: { slot: TimeSlot; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!slot.available}
      onClick={onSelect}
      className={cn(
        "flex h-11 flex-col items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
        slot.available && !selected && "bg-white hover:border-primary/40 hover:bg-accent/50",
        selected && "border-primary bg-primary text-white",
        !slot.available && "cursor-not-allowed border-transparent bg-muted text-muted-foreground/70",
      )}
      aria-label={`${formatTime(slot.time)}${slot.available ? "" : slot.reason === "BOOKED" ? ", booked" : ", unavailable"}`}
    >
      <span className={cn(!slot.available && "line-through decoration-muted-foreground/40")}>{formatTime(slot.time)}</span>
      {!slot.available && <span className="text-[10px] leading-none font-normal no-underline">{slot.reason === "BOOKED" ? "Booked" : "Unavailable"}</span>}
    </button>
  );
}
