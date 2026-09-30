import type { ClinicSettings } from "@/types";
import type { InvoiceView } from "@/types/views";
import { LogoMark } from "@/components/shared/logo";
import { InvoiceStatusBadge } from "@/components/shared/status-badge";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Printable invoice (used by the billing view dialog and the print page). */
export function InvoiceDocument({ invoice, clinic }: { invoice: InvoiceView; clinic: Pick<ClinicSettings, "name" | "address" | "phone" | "email"> }) {
  return (
    <article className="print-sheet mx-auto max-w-3xl rounded-xl border bg-white p-8 text-sm sm:p-10">
      <header className="flex flex-col justify-between gap-6 border-b pb-6 sm:flex-row">
        <div className="flex items-start gap-3">
          <LogoMark className="size-10" />
          <div>
            <p className="text-lg font-semibold">{clinic.name}</p>
            <p className="max-w-xs text-xs text-muted-foreground">{clinic.address}</p>
            <p className="text-xs text-muted-foreground">
              {clinic.phone} · {clinic.email}
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold tracking-tight">Invoice</p>
          <p className="font-mono text-xs text-muted-foreground">{invoice.number}</p>
          <div className="mt-2">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 py-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Billed to</p>
          <p className="font-medium">{invoice.patientName}</p>
          <p className="text-xs text-muted-foreground">
            {invoice.patientId} · {invoice.patientPhone}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Invoice date</p>
          <p className="font-medium">{formatDate(invoice.date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Due date</p>
          <p className="font-medium">{formatDate(invoice.dueDate)}</p>
        </div>
      </section>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-y bg-canvas text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Treatment</th>
            <th className="px-3 py-2 text-right font-medium">Qty</th>
            <th className="px-3 py-2 text-right font-medium">Price</th>
            <th className="px-3 py-2 text-right font-medium">Discount</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="px-3 py-2.5">{i.description}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{i.quantity}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(i.price, true)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{i.discount ? `− ${formatCurrency(i.discount, true)}` : "—"}</td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums">{formatCurrency(i.quantity * i.price - i.discount, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5">
          {[
            ["Subtotal", formatCurrency(invoice.subtotal, true)],
            ["Discount", `− ${formatCurrency(invoice.discountTotal, true)}`],
            [`Tax (${invoice.taxRate}%)`, formatCurrency(invoice.tax, true)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="tabular-nums">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(invoice.total, true)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Paid</dt>
            <dd className="tabular-nums">{formatCurrency(invoice.paid, true)}</dd>
          </div>
          {invoice.refunded > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Refunded</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.refunded, true)}</dd>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <dt>Balance due</dt>
            <dd className="tabular-nums">{formatCurrency(invoice.balance, true)}</dd>
          </div>
        </dl>
      </div>

      {invoice.payments.length > 0 && (
        <section className="mt-8">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Payment history</p>
          <ul className="divide-y rounded-lg border">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span>
                  {formatDate(p.date)} · {PAYMENT_METHOD_LABELS[p.method]}
                  {p.reference && <span className="text-xs text-muted-foreground"> · {p.reference}</span>}
                </span>
                <span className={p.type === "REFUND" ? "font-medium text-destructive tabular-nums" : "font-medium tabular-nums"}>
                  {p.type === "REFUND" ? "Refund − " : ""}
                  {formatCurrency(p.amount, true)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {invoice.notes && <p className="mt-6 text-xs text-muted-foreground">{invoice.notes}</p>}
      <p className="mt-10 text-center text-[11px] text-muted-foreground">Thank you for choosing {clinic.name}. This is a computer-generated invoice.</p>
    </article>
  );
}
