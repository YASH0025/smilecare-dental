import "server-only";
import type { Invoice, InvoiceItem, InvoiceStatus, Patient, Payment, ReceiptEmailResult } from "@/types";
import type { InvoiceView } from "@/types/views";
import { invoiceRepository, patientRepository, paymentRepository, settingsRepository } from "@/lib/repositories";
import { invoiceSchema, paymentSchema } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils/format";
import { badRequest, conflict, notFound } from "./errors";
import { notificationService } from "./notification.service";
import { settingsService } from "./settings.service";
import { sendMail } from "@/lib/email/mailer";
import { paymentReceiptEmail } from "@/lib/email/templates";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pure invoice maths.
 * - Discounts are flat per line and applied before tax.
 * - `paid` is NET of refunds; `refunded` is the refunded amount.
 * - Refunds are treated as a credit adjustment: they don't re-open the balance.
 */
export function computeTotals(items: InvoiceItem[], taxRate: number, payments: Payment[], requested?: InvoiceStatus) {
  const subtotal = round2(items.reduce((s, i) => s + i.quantity * i.price, 0));
  const discountTotal = round2(items.reduce((s, i) => s + i.discount, 0));
  const taxable = Math.max(0, subtotal - discountTotal);
  const tax = round2((taxable * taxRate) / 100);
  const total = round2(taxable + tax);
  const gross = round2(payments.filter((p) => p.type === "PAYMENT").reduce((s, p) => s + p.amount, 0));
  const refunded = round2(payments.filter((p) => p.type === "REFUND").reduce((s, p) => s + p.amount, 0));
  const paid = round2(gross - refunded);
  const balance = round2(Math.max(0, total - gross));

  let status: InvoiceStatus;
  if (requested === "CANCELLED" || requested === "DRAFT") status = requested;
  else if (refunded > 0 && paid <= 0) status = "REFUNDED";
  else if (gross <= 0) status = "UNPAID";
  else if (gross < total) status = "PARTIAL";
  else status = "PAID";

  return { totals: { subtotal, discountTotal, tax, total, paid, refunded, balance, status }, gross };
}

/**
 * Emails the payment receipt to the patient. Never throws — a mail failure must
 * not undo a payment that was already collected.
 */
async function sendReceipt(patient: Patient | null, invoice: Invoice, payment: Payment): Promise<ReceiptEmailResult> {
  const sentAt = new Date().toISOString();
  const to = patient?.email?.trim() ?? "";
  if (!patient || !to) return { status: "SKIPPED", to: "", error: "Patient has no email address", sentAt };
  try {
    const clinic = await settingsService.get();
    const mail = paymentReceiptEmail({ clinic, patient, invoice, payment });
    const result = await sendMail({ to, replyTo: clinic.email || undefined, ...mail }, clinic.name);
    return { status: "SENT", to, previewUrl: result.previewUrl, sentAt };
  } catch (error) {
    console.error("[mail] receipt failed", error);
    return { status: "FAILED", to, error: error instanceof Error ? error.message : "Unknown mail error", sentAt };
  }
}

async function withView(invoices: Invoice[]): Promise<InvoiceView[]> {
  const [patients, payments] = await Promise.all([patientRepository.getAll(), paymentRepository.getAll()]);
  const pmap = new Map(patients.map((p) => [p.id, p]));
  return invoices.map((i) => ({
    ...i,
    patientName: pmap.get(i.patientId)?.name ?? "Unknown patient",
    patientPhone: pmap.get(i.patientId)?.phone ?? "",
    patientEmail: pmap.get(i.patientId)?.email ?? "",
    payments: payments.filter((p) => p.invoiceId === i.id).sort((a, b) => b.date.localeCompare(a.date)),
  }));
}

export const billingService = {
  async list(filters: { status?: string; patientId?: string; q?: string } = {}) {
    const all = await invoiceRepository.getAll();
    const views = await withView(all);
    const q = filters.q?.toLowerCase().trim();
    return views
      .filter((i) => !filters.patientId || i.patientId === filters.patientId)
      .filter((i) => {
        if (!filters.status || filters.status === "ALL") return true;
        if (filters.status === "OUTSTANDING") return ["UNPAID", "PARTIAL"].includes(i.status);
        return i.status === filters.status;
      })
      .filter((i) => !q || i.number.toLowerCase().includes(q) || i.patientName.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number));
  },

  async get(id: string) {
    const invoice = await invoiceRepository.getById(id);
    if (!invoice) throw notFound("Invoice");
    return (await withView([invoice]))[0];
  },

  async create(input: unknown) {
    const data = invoiceSchema.parse(input);
    if (!(await patientRepository.getById(data.patientId))) throw notFound("Patient");
    const settings = await settingsRepository.get();
    const { totals } = computeTotals(data.items, data.taxRate, [], data.status);
    const created = await invoiceRepository.transaction((items) => {
      const year = data.date.slice(0, 4);
      const seq =
        items.filter((i) => i.number.includes(`-${year}-`)).reduce((m, i) => Math.max(m, Number(i.number.split("-").pop()) || 0), 0) + 1;
      const now = new Date().toISOString();
      const nextId = items.reduce((m, i) => Math.max(m, Number(i.id.replace("INV-", "")) || 0), 0) + 1;
      const invoice: Invoice = {
        id: `INV-${String(nextId).padStart(4, "0")}`,
        number: `${settings.invoicePrefix}-${year}-${String(seq).padStart(4, "0")}`,
        patientId: data.patientId,
        date: data.date,
        dueDate: data.dueDate,
        items: data.items,
        taxRate: data.taxRate,
        notes: data.notes,
        ...totals,
        createdAt: now,
        updatedAt: now,
      };
      return { items: [...items, invoice], result: invoice };
    });
    return this.get(created.id);
  },

  async update(id: string, input: unknown) {
    const data = invoiceSchema.parse(input);
    const current = await invoiceRepository.getById(id);
    if (!current) throw notFound("Invoice");
    const payments = await paymentRepository.findMany((p) => p.invoiceId === id);
    const { totals, gross } = computeTotals(data.items, data.taxRate, payments, data.status);
    if (gross > totals.total + 0.001) {
      throw badRequest(`Total cannot be lower than the ${formatCurrency(gross)} already received. Issue a refund first.`, "TOTAL_BELOW_PAID");
    }
    await invoiceRepository.update(id, {
      patientId: data.patientId,
      date: data.date,
      dueDate: data.dueDate,
      items: data.items,
      taxRate: data.taxRate,
      notes: data.notes,
      ...totals,
    });
    return this.get(id);
  },

  async cancel(id: string) {
    const current = await invoiceRepository.getById(id);
    if (!current) throw notFound("Invoice");
    if (current.paid > 0) throw conflict("Refund all payments before cancelling this invoice", "HAS_PAYMENTS");
    await invoiceRepository.update(id, { status: "CANCELLED" });
    return this.get(id);
  },

  async delete(id: string) {
    const payments = await paymentRepository.findMany((p) => p.invoiceId === id);
    if (payments.length) throw conflict("Invoices with recorded payments cannot be deleted. Cancel it instead.", "HAS_PAYMENTS");
    if (!(await invoiceRepository.delete(id))) throw notFound("Invoice");
    return { id };
  },

  async addPayment(invoiceId: string, input: unknown) {
    const data = paymentSchema.parse(input);
    const invoice = await invoiceRepository.getById(invoiceId);
    if (!invoice) throw notFound("Invoice");
    if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
      throw badRequest(`Payments can't be recorded on a ${invoice.status.toLowerCase()} invoice`, "INVALID_INVOICE_STATE");
    }
    const existing = await paymentRepository.findMany((p) => p.invoiceId === invoiceId);
    const { totals: before } = computeTotals(invoice.items, invoice.taxRate, existing);

    if (data.type === "PAYMENT" && data.amount > before.balance + 0.001) {
      throw badRequest(
        before.balance <= 0
          ? "This invoice is already fully paid"
          : `Payment exceeds the outstanding balance of ${formatCurrency(before.balance, true)}`,
        "OVERPAYMENT",
      );
    }
    if (data.type === "REFUND" && data.amount > before.paid + 0.001) {
      throw badRequest(`Refund exceeds the refundable amount of ${formatCurrency(before.paid, true)}`, "OVER_REFUND");
    }

    const payment = await paymentRepository.create({ ...data, invoiceId, patientId: invoice.patientId });
    const { totals } = computeTotals(invoice.items, invoice.taxRate, [...existing, payment]);
    await invoiceRepository.update(invoiceId, totals);

    let receipt: ReceiptEmailResult | undefined;
    if (data.type === "PAYMENT") {
      const patient = await patientRepository.getById(invoice.patientId);
      receipt = await sendReceipt(patient, { ...invoice, ...totals }, payment);
      await paymentRepository.update(payment.id, { receipt });
      await notificationService.notify(
        "PAYMENT_RECEIVED",
        "Payment received",
        `${formatCurrency(data.amount)} from ${patient?.name ?? "patient"} · ${invoice.number}${receipt.status === "SENT" ? " · receipt emailed" : ""}`,
        `/admin/billing?q=${invoice.number}`,
      );
    }
    return { ...(await this.get(invoiceId)), receipt };
  },

  async listPayments() {
    const [payments, patients, invoices] = await Promise.all([
      paymentRepository.getAll(),
      patientRepository.getAll(),
      invoiceRepository.getAll(),
    ]);
    const pmap = new Map(patients.map((p) => [p.id, p.name]));
    const imap = new Map(invoices.map((i) => [i.id, i.number]));
    return payments
      .map((p) => ({ ...p, patientName: pmap.get(p.patientId) ?? "—", invoiceNumber: imap.get(p.invoiceId) ?? p.invoiceId }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  },
};
