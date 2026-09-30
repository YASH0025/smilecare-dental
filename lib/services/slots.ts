import type { Appointment, Dentist, TimeSlot } from "@/types";
import { BLOCKING_STATUSES } from "@/lib/constants";
import { fromMinutes, overlaps, toMinutes } from "@/lib/utils/time";
import { format, parse } from "date-fns";

export interface SlotInput {
  dentist: Dentist;
  date: string; // yyyy-MM-dd
  duration: number; // minutes the new appointment needs
  interval: number; // grid step in minutes
  appointments: Appointment[]; // any appointments; filtered here
  excludeId?: string; // appointment being rescheduled
  now?: Date;
}

export interface DayAvailability {
  working: boolean;
  onLeave: boolean;
  leaveReason?: string;
  slots: TimeSlot[];
}

/**
 * Pure slot calculator (no I/O) — used by the public booking flow, the admin
 * reschedule dialog and the server-side double-booking guard.
 */
export function computeSlots({ dentist, date, duration, interval, appointments, excludeId, now = new Date() }: SlotInput): DayAvailability {
  const day = parse(date, "yyyy-MM-dd", new Date());
  const weekday = day.getDay();
  const hours = dentist.workingHours.find((w) => w.day === weekday);

  const leave = dentist.leaves.find((l) => date >= l.from && date <= l.to);
  if (leave) return { working: Boolean(hours?.enabled), onLeave: true, leaveReason: leave.reason, slots: [] };
  if (!hours || !hours.enabled) return { working: false, onLeave: false, slots: [] };

  const start = toMinutes(hours.start);
  const end = toMinutes(hours.end);
  const breakStart = hours.breakStart ? toMinutes(hours.breakStart) : null;
  const breakEnd = hours.breakEnd ? toMinutes(hours.breakEnd) : null;

  const booked = appointments
    .filter((a) => a.dentistId === dentist.id && a.date === date && a.id !== excludeId && BLOCKING_STATUSES.includes(a.status))
    .map((a) => ({ start: toMinutes(a.time), end: toMinutes(a.time) + a.duration }));

  const todayKey = format(now, "yyyy-MM-dd");
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isPastDay = date < todayKey;

  const slots: TimeSlot[] = [];
  for (let t = start; t + duration <= end; t += interval) {
    const slotEnd = t + duration;
    let reason: TimeSlot["reason"];
    if (isPastDay || (date === todayKey && t <= nowMinutes + 30)) reason = "PAST";
    else if (breakStart !== null && breakEnd !== null && overlaps(t, slotEnd, breakStart, breakEnd)) reason = "BREAK";
    else if (booked.some((b) => overlaps(t, slotEnd, b.start, b.end))) reason = "BOOKED";

    // Break slots are hidden entirely; booked/past are shown disabled.
    if (reason === "BREAK") continue;
    slots.push({ time: fromMinutes(t), available: !reason, reason });
  }

  return { working: true, onLeave: false, slots };
}

export function isSlotBookable(input: SlotInput & { time: string }) {
  const { slots, working, onLeave } = computeSlots(input);
  if (!working || onLeave) return false;
  // Allow off-grid times as long as they fit working hours and don't clash.
  const onGrid = slots.find((s) => s.time === input.time);
  if (onGrid) return onGrid.available;
  const probe = computeSlots({ ...input, interval: 5 });
  return probe.slots.some((s) => s.time === input.time && s.available);
}
