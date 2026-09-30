import "server-only";
import type { ClinicSettings, Invoice, Patient, Payment } from "@/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Payment receipt sent to the patient after a payment is recorded. */
export function paymentReceiptEmail({
  clinic,
  patient,
  invoice,
  payment,
}: {
  clinic: ClinicSettings;
  patient: Patient;
  invoice: Invoice;
  payment: Payment;
}) {
  const method = PAYMENT_METHOD_LABELS[payment.method];
  const fullyPaid = invoice.balance <= 0;
  const subject = `Payment received – ${formatCurrency(payment.amount, true)} · ${invoice.number}`;

  const rows: [string, string][] = [
    ["Invoice", invoice.number],
    ["Amount paid", formatCurrency(payment.amount, true)],
    ["Payment method", method],
    ...(payment.reference ? ([["Reference / UTR", payment.reference]] as [string, string][]) : []),
    ["Date", formatDate(payment.date)],
    ["Invoice total", formatCurrency(invoice.total, true)],
    ["Balance due", fullyPaid ? "Nil — fully paid" : formatCurrency(invoice.balance, true)],
  ];

  const items = invoice.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eef1f6;color:#334155">${esc(i.description)}${i.quantity > 1 ? ` × ${i.quantity}` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right;color:#334155">${formatCurrency(i.quantity * i.price - i.discount, true)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f7fb;font-family:Segoe UI,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5eaf2">
        <tr><td style="background:#1f5ad6;padding:20px 28px;color:#ffffff">
          <div style="font-size:20px;font-weight:700">${esc(clinic.name)}</div>
          <div style="font-size:13px;opacity:.85">${esc(clinic.tagline)}</div>
        </td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 6px;font-size:13px;color:#16a34a;font-weight:600;letter-spacing:.02em">✓ PAYMENT RECEIVED</p>
          <h1 style="margin:0 0 16px;font-size:26px;color:#0f172a">${formatCurrency(payment.amount, true)}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155">
            Dear ${esc(patient.name)},<br>thank you for your payment. Here is your receipt for your records.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:20px">
            ${rows
              .map(
                ([k, v]) => `<tr>
              <td style="padding:7px 0;color:#64748b">${esc(k)}</td>
              <td style="padding:7px 0;text-align:right;color:#0f172a;font-weight:600">${esc(v)}</td>
            </tr>`,
              )
              .join("")}
          </table>
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Invoice items</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${items}</table>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b">
            Questions about this payment? Call us on ${esc(clinic.phone)} or reply to ${esc(clinic.email)}.
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 28px;font-size:12px;color:#94a3b8">
          ${esc(clinic.name)} · ${esc(clinic.address)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `${clinic.name} — Payment received`,
    "",
    `Dear ${patient.name},`,
    "Thank you for your payment. Receipt details:",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Items:",
    ...invoice.items.map((i) => `- ${i.description}${i.quantity > 1 ? ` × ${i.quantity}` : ""}: ${formatCurrency(i.quantity * i.price - i.discount, true)}`),
    "",
    `Questions? Call ${clinic.phone} or email ${clinic.email}.`,
  ].join("\n");

  return { subject, html, text };
}
