import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Enter a valid 10-digit Indian mobile number");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const optionalEmail = z.union([emailSchema, z.literal("")]);

export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");
export const timeKey = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the format HH:mm");

export const idSchema = z.string().trim().min(1, "Required");

export const nonEmpty = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const money = z.number({ message: "Enter an amount" }).min(0, "Cannot be negative").max(10_000_000);

/** Accepts absolute URLs or site-relative paths such as /images/x.svg. */
export const imageUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Use a URL or a /images/... path");
