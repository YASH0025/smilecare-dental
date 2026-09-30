import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/types";
import { dateKey, emailSchema, idSchema, nonEmpty, optionalEmail, phoneSchema, timeKey } from "./common";

/** Public booking form (website). */
export const bookingSchema = z.object({
  fullName: nonEmpty("Full name", 80).min(2, "Enter your full name"),
  phone: phoneSchema,
  email: emailSchema,
  dateOfBirth: dateKey.refine((v) => new Date(v) < new Date(), "Date of birth must be in the past"),
  serviceId: idSchema,
  dentistId: idSchema,
  date: dateKey,
  time: timeKey,
  reason: nonEmpty("Reason for visit", 300),
  notes: z.string().trim().max(1000),
});
export type BookingInput = z.infer<typeof bookingSchema>;

/** Admin appointment creation — can reference an existing patient or create one. */
export const appointmentCreateSchema = z.object({
  patientId: z.string().optional(),
  patientName: nonEmpty("Patient name", 80),
  phone: phoneSchema,
  email: optionalEmail,
  dateOfBirth: z.union([dateKey, z.literal("")]).optional(),
  serviceId: idSchema,
  dentistId: idSchema,
  date: dateKey,
  time: timeKey,
  reason: z.string().trim().max(300),
  notes: z.string().trim().max(1000),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  source: z.enum(["ONLINE", "PHONE", "WALK_IN", "ADMIN"]).optional(),
});
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

export const appointmentUpdateSchema = z
  .object({
    status: z.enum(APPOINTMENT_STATUSES),
    date: dateKey,
    time: timeKey,
    dentistId: idSchema,
    serviceId: idSchema,
    reason: z.string().trim().max(300),
    notes: z.string().trim().max(1000),
    note: z.string().trim().max(300),
  })
  .partial();
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;

export const rescheduleSchema = z.object({
  date: dateKey,
  time: timeKey,
  note: z.string().trim().max(300).optional(),
});
export type RescheduleInput = z.infer<typeof rescheduleSchema>;

export const slotQuerySchema = z.object({
  dentistId: idSchema,
  date: dateKey,
  serviceId: z.string().optional(),
  excludeId: z.string().optional(),
});
