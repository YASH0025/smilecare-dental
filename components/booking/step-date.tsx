"use client";

import { Calendar } from "@/components/ui/calendar";
import { bookingWindow, dentistWorksOn } from "@/lib/utils/availability";
import { toDateKey } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/constants";
import type { BookingDentist } from "./types";

export function StepDate({
  dentist,
  windowDays,
  value,
  onChange,
}: {
  dentist: BookingDentist;
  windowDays: number;
  value?: Date;
  onChange: (dateKey: string) => void;
}) {
  const { from, to } = bookingWindow(windowDays);
  const workDays = dentist.workingHours.filter((w) => w.enabled).map((w) => WEEKDAYS[w.day].slice(0, 3));

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className="rounded-lg border bg-white md:w-fit">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => d && onChange(toDateKey(d))}
          defaultMonth={value ?? from}
          startMonth={from}
          endMonth={to}
          disabled={[{ before: from }, { after: to }, (d: Date) => !dentistWorksOn(dentist, d)]}
          className="w-full [--cell:2.5rem]"
        />
      </div>
      <div className="space-y-3 text-sm md:max-w-xs">
        <div className="rounded-lg border bg-canvas p-4">
          <p className="font-medium">{dentist.name} consults on</p>
          <p className="mt-1 text-muted-foreground">{workDays.join(", ")}</p>
        </div>
        {dentist.leaves.filter((l) => l.to >= toDateKey(from)).length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-medium">Planned leave</p>
            <ul className="mt-1 space-y-0.5">
              {dentist.leaves
                .filter((l) => l.to >= toDateKey(from))
                .map((l) => (
                  <li key={l.id}>
                    {l.from === l.to ? l.from : `${l.from} → ${l.to}`}
                  </li>
                ))}
            </ul>
          </div>
        )}
        <p className="text-muted-foreground">Bookings are open up to {windowDays} days ahead.</p>
      </div>
    </div>
  );
}
