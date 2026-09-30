import { differenceInYears, parse } from "date-fns";

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

export const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;

export function ageFrom(dob: string | undefined | null) {
  if (!dob) return null;
  try {
    return differenceInYears(new Date(), parse(dob, "yyyy-MM-dd", new Date()));
  } catch {
    return null;
  }
}
