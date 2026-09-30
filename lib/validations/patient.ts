import { z } from "zod";
import { TOOTH_CONDITIONS } from "@/types";
import { dateKey, nonEmpty, optionalEmail, phoneSchema } from "./common";

export const patientSchema = z.object({
  name: nonEmpty("Name", 80).min(2, "Enter the full name"),
  phone: phoneSchema,
  email: optionalEmail,
  dateOfBirth: dateKey.refine((v) => new Date(v) < new Date(), "Date of birth must be in the past"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().trim().max(300),
  bloodGroup: z.string().trim().max(5),
  allergies: z.string().trim().max(500),
  medicalHistory: z.string().trim().max(2000),
  dentalHistory: z.string().trim().max(2000),
  emergencyContact: z.string().trim().max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
export type PatientInput = z.infer<typeof patientSchema>;

export const patientUpdateSchema = patientSchema.partial();

export const toothUpdateSchema = z.object({
  teeth: z.array(z.string().regex(/^[1-4][1-8]$/, "Invalid tooth number")).min(1, "Select at least one tooth"),
  condition: z.enum(TOOTH_CONDITIONS),
  notes: z.string().trim().max(300).optional(),
});
export type ToothUpdateInput = z.infer<typeof toothUpdateSchema>;

export const patientNoteSchema = z.object({
  text: nonEmpty("Note", 2000),
});

export const patientDocumentSchema = z.object({
  name: nonEmpty("Document name", 120),
  type: z.enum(["X_RAY", "REPORT", "CONSENT", "PRESCRIPTION", "OTHER"]),
  date: dateKey,
  notes: z.string().trim().max(300),
});
export type PatientDocumentInput = z.infer<typeof patientDocumentSchema>;
