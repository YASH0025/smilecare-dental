import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatCurrency, formatDate, formatTime, formatDateTime, initials, slugify, toDateKey } from "./format";
