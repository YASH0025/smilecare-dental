import { z } from "zod";
import { TREATMENT_STATUSES } from "@/types";
import { dateKey, idSchema, money, nonEmpty } from "./common";

export const treatmentSchema = z.object({
  patientId: idSchema,
  dentistId: idSchema,
  serviceId: z.string().optional(),
  title: nonEmpty("Title", 120),
  teeth: z.array(z.string()),
  steps: z
    .array(z.object({ id: z.string(), label: nonEmpty("Step", 80), done: z.boolean() }))
    .min(1, "Add at least one step"),
  cost: money,
  status: z.enum(TREATMENT_STATUSES),
  startDate: dateKey,
  endDate: z.union([dateKey, z.literal("")]).optional(),
  followUpDate: z.union([dateKey, z.literal("")]).optional(),
  notes: z.string().trim().max(2000),
});
export type TreatmentInput = z.infer<typeof treatmentSchema>;
export const treatmentUpdateSchema = treatmentSchema.partial();

export const medicineSchema = z.object({
  name: nonEmpty("Medicine", 80),
  dosage: nonEmpty("Dosage", 40),
  frequency: nonEmpty("Frequency", 60),
  duration: nonEmpty("Duration", 40),
  instructions: z.string().trim().max(200),
});

export const prescriptionSchema = z.object({
  patientId: idSchema,
  dentistId: idSchema,
  appointmentId: z.string().optional(),
  date: dateKey,
  diagnosis: nonEmpty("Diagnosis", 200),
  medicines: z.array(medicineSchema).min(1, "Add at least one medicine"),
  advice: z.string().trim().max(1000),
});
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export const prescriptionUpdateSchema = prescriptionSchema.partial();
