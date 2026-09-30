import { z } from "zod";
import { PAYMENT_METHODS } from "@/types";
import { dateKey, idSchema, money, nonEmpty } from "./common";

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: nonEmpty("Description", 120),
  treatmentId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number({ message: "Qty" }).int("Whole numbers only").min(1, "Min 1").max(100),
  price: money,
  discount: money,
});

export const invoiceSchema = z
  .object({
    patientId: idSchema,
    date: dateKey,
    dueDate: dateKey,
    items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
    taxRate: z.number().min(0).max(28),
    notes: z.string().trim().max(1000),
    status: z.enum(["DRAFT", "UNPAID", "CANCELLED"]).optional(),
  })
  .refine((v) => v.dueDate >= v.date, { message: "Due date must be on or after the invoice date", path: ["dueDate"] })
  .refine((v) => v.items.every((i) => i.discount <= i.price * i.quantity), {
    message: "A line discount cannot exceed the line amount",
    path: ["items"],
  });
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  amount: z.number({ message: "Enter an amount" }).positive("Amount must be greater than zero"),
  method: z.enum(PAYMENT_METHODS),
  type: z.enum(["PAYMENT", "REFUND"]),
  date: dateKey,
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(300),
});
export type PaymentInput = z.infer<typeof paymentSchema>;
