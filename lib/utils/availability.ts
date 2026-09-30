import { addDays, startOfDay } from "date-fns";
import type { Dentist } from "@/types";
import { toDateKey } from "./format";

/** Client-safe check used to grey out calendar days before slots are fetched. */
export function dentistWorksOn(dentist: Pick<Dentist, "workingHours" | "leaves">, date: Date) {
  const wd = dentist.workingHours.find((w) => w.day === date.getDay());
  if (!wd?.enabled) return false;
  const key = toDateKey(date);
  return !dentist.leaves.some((l) => key >= l.from && key <= l.to);
}

export function bookingWindow(days: number) {
  const from = startOfDay(new Date());
  return { from, to: addDays(from, days) };
}
