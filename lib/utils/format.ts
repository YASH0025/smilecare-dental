import { format, parse, parseISO } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, precise = false) {
  return (precise ? inrPrecise : inr).format(Number.isFinite(value) ? value : 0);
}

/** Formats a `yyyy-MM-dd` key or ISO string. */
export function formatDate(value: string | undefined | null, pattern = "d MMM yyyy") {
  if (!value) return "—";
  try {
    const date = value.length === 10 ? parse(value, "yyyy-MM-dd", new Date()) : parseISO(value);
    return format(date, pattern);
  } catch {
    return value;
  }
}

/** Formats an `HH:mm` string as `9:30 AM`. */
export function formatTime(value: string | undefined | null) {
  if (!value) return "—";
  try {
    return format(parse(value, "HH:mm", new Date()), "h:mm a");
  } catch {
    return value;
  }
}

export function formatDateTime(value: string | undefined | null) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "d MMM yyyy, h:mm a");
  } catch {
    return value;
  }
}

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
