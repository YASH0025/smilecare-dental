"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Ban, ExternalLink, MailCheck, MailX, MoreHorizontal, Pencil, Plus, ReceiptText, RotateCcw, Trash2, Wallet, X } from "lucide-react";
import type { InvoiceView } from "@/types/views";
import type { ReceiptEmailResult } from "@/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InvoiceStatusBadge } from "@/components/shared/status-badge";
import { InvoiceFormDialog, type BillableService, type BillableTreatment } from "@/components/forms/invoice-form-dialog";
import { PaymentDialog } from "@/components/forms/payment-dialog";
import { CollectPaymentDialog } from "@/components/forms/collect-payment-dialog";
import { INVOICE_STATUS_META, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { INVOICE_STATUSES } from "@/types";
import { combineQueries, useCancelInvoice, useDeleteInvoice, useInvoices, useLookups, usePayments, useSettings, useTreatments, type PaymentRow } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { StatCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, CircleDollarSign, IndianRupee, Undo2 } from "lucide-react";

type ScreenProps = { initialStatus?: string; initialQuery?: string; openCreate?: boolean };

export function BillingScreen(props: ScreenProps) {
  const query = combineQueries(useInvoices(), usePayments(), useLookups(), useTreatments(), useSettings());
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load billing"
      loading={
        <div className="space-y-6">
          <PageHeader title="Billing" description="Loading invoices and payments…" className="mb-0" />
          <StatCardsSkeleton count={4} className="sm:grid-cols-2 xl:grid-cols-4" />
          <TableSkeleton columns={8} />
        </div>
      }
    >
      {([invoices, payments, lookups, treatments, settings]) => (
        <BillingView
          {...props}
          invoices={invoices}
          payments={payments}
          patients={lookups.patients}
          services={lookups.fullServices.map((s) => ({ id: s.id, name: s.name, price: s.price }))}
          treatments={treatments.map((t) => ({ id: t.id, patientId: t.patientId, title: t.title, cost: t.cost }))}
          taxRate={settings.taxRate}
        />
      )}
    </RenderContent>
  );
}

function BillingView({
  invoices,
  payments,
  patients,
  services,
  treatments,
  taxRate,
  initialStatus,
  initialQuery,
  openCreate,
}: {
  invoices: InvoiceView[];
  payments: PaymentRow[];
  patients: PatientOption[];
  services: BillableService[];
  treatments: BillableTreatment[];
  taxRate: number;
  initialStatus?: string;
  initialQuery?: string;
  openCreate?: boolean;
}) {
  const cancelInvoice = useCancelInvoice();
  const deleteInvoice = useDeleteInvoice();
  const [q, setQ] = React.useState(initialQuery ?? "");
  const [status, setStatus] = React.useState(initialStatus ?? "ALL");
  const [form, setForm] = React.useState<{ open: boolean; value: InvoiceView | null }>({ open: Boolean(openCreate), value: null });
  const [pay, setPay] = React.useState<{ invoice: InvoiceView | null; type: "PAYMENT" | "REFUND" }>({ invoice: null, type: "PAYMENT" });
  const [collect, setCollect] = React.useState<InvoiceView | null>(null);
  const [confirm, setConfirm] = React.useState<{ kind: "cancel" | "delete"; invoice: InvoiceView } | null>(null);
  const [pq, setPq] = React.useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const month = today.slice(0, 7);
  const collected = payments.filter((p) => p.date.startsWith(month)).reduce((s, p) => s + (p.type === "PAYMENT" ? p.amount : -p.amount), 0);
  const refunds = payments.filter((p) => p.type === "REFUND" && p.date.startsWith(month)).reduce((s, p) => s + p.amount, 0);
  const open = invoices.filter((i) => i.status === "UNPAID" || i.status === "PARTIAL");
  const outstanding = open.reduce((s, i) => s + i.balance, 0);
  const overdue = open.filter((i) => i.dueDate < today);

  const needle = q.toLowerCase().trim();
  const filtered = invoices.filter(
    (i) =>
      (status === "ALL" ||
        (status === "OUTSTANDING" ? ["UNPAID", "PARTIAL"].includes(i.status) : status === "OVERDUE" ? ["UNPAID", "PARTIAL"].includes(i.status) && i.dueDate < today : i.status === status)) &&
      (!needle || i.number.toLowerCase().includes(needle) || i.patientName.toLowerCase().includes(needle) || i.items.some((x) => x.description.toLowerCase().includes(needle))),
  );
  const inv = usePagination(filtered);
  const payFiltered = payments.filter((p) => !pq || p.patientName.toLowerCase().includes(pq.toLowerCase()) || p.invoiceNumber.toLowerCase().includes(pq.toLowerCase()));
  const pays = usePagination(payFiltered);

  async function runConfirm() {
    if (!confirm) return;
    if (confirm.kind === "cancel") await cancelInvoice.mutateAsync(confirm.invoice.id);
    else await deleteInvoice.mutateAsync(confirm.invoice.id);
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoices, payments, refunds and outstanding balances."
        actions={
          <Button onClick={() => setForm({ open: true, value: null })}>
            <Plus /> New invoice
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected this month" value={formatCurrency(collected)} icon={IndianRupee} tone="green" hint="Net of refunds" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={CircleDollarSign} tone="amber" hint={`${open.length} open invoices`} />
        <StatCard label="Overdue" value={overdue.length} icon={AlertTriangle} tone="red" hint={formatCurrency(overdue.reduce((s, i) => s + i.balance, 0))} />
        <StatCard label="Refunds this month" value={formatCurrency(refunds)} icon={Undo2} tone="gray" />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <TableCard>
            <DataToolbar search={q} onSearch={setQ} placeholder="Search invoice no., patient or item">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[170px]" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All invoices</SelectItem>
                  <SelectItem value="OUTSTANDING">Outstanding</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {INVOICE_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(q || status !== "ALL") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQ("");
                    setStatus("ALL");
                  }}
                >
                  <X /> Clear
                </Button>
              )}
            </DataToolbar>
            {filtered.length === 0 ? (
              <EmptyState icon={ReceiptText} title="No invoices found" description="No invoices match the selected filters." />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.pageItems.map((i) => {
                      const isOverdue = ["UNPAID", "PARTIAL"].includes(i.status) && i.dueDate < today;
                      const closed = i.status === "CANCELLED";
                      return (
                        <TableRow key={i.id}>
                          <TableCell>
                            <span className="font-mono text-xs">{i.number}</span>
                            <span className="block max-w-[180px] truncate text-xs text-muted-foreground">{i.items.map((x) => x.description).join(", ")}</span>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/patients/${i.patientId}?tab=billing`} className="font-medium hover:text-primary">
                              {i.patientName}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(i.date)}</TableCell>
                          <TableCell className={isOverdue ? "font-medium text-destructive" : ""}>{formatDate(i.dueDate)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(i.total)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(i.paid)}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{formatCurrency(i.balance)}</TableCell>
                          <TableCell>
                            <InvoiceStatusBadge status={i.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${i.number}`}>
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/print/invoices/${i.id}`} target="_blank">
                                    <ExternalLink /> View / print
                                  </Link>
                                </DropdownMenuItem>
                                {!closed && i.status !== "DRAFT" && i.balance > 0 && (
                                  <>
                                    <DropdownMenuItem onSelect={() => setCollect(i)}>
                                      <IndianRupee /> Collect payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setPay({ invoice: i, type: "PAYMENT" })}>
                                      <Wallet /> Record other payment
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {!closed && i.paid > 0 && (
                                  <DropdownMenuItem onSelect={() => setPay({ invoice: i, type: "REFUND" })}>
                                    <RotateCcw /> Issue refund
                                  </DropdownMenuItem>
                                )}
                                {!closed && (
                                  <DropdownMenuItem onSelect={() => setForm({ open: true, value: i })}>
                                    <Pencil /> Edit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {!closed && i.paid <= 0 && (
                                  <DropdownMenuItem onSelect={() => setConfirm({ kind: "cancel", invoice: i })}>
                                    <Ban /> Cancel invoice
                                  </DropdownMenuItem>
                                )}
                                {i.payments.length === 0 && (
                                  <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ kind: "delete", invoice: i })}>
                                    <Trash2 /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Pagination page={inv.page} pageCount={inv.pageCount} total={inv.total} pageSize={inv.pageSize} onPageChange={inv.setPage} />
              </>
            )}
          </TableCard>
        </TabsContent>

        <TabsContent value="payments">
          <TableCard>
            <DataToolbar search={pq} onSearch={setPq} placeholder="Search patient or invoice no." />
            {payFiltered.length === 0 ? (
              <EmptyState title="No payments recorded" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pays.pageItems.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                        <TableCell>{formatDate(p.date)}</TableCell>
                        <TableCell className="font-medium">{p.patientName}</TableCell>
                        <TableCell className="font-mono text-xs">{p.invoiceNumber}</TableCell>
                        <TableCell>{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                        <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
                        <TableCell>
                          <ReceiptCell receipt={p.receipt} />
                        </TableCell>
                        <TableCell className={`text-right font-medium tabular-nums ${p.type === "REFUND" ? "text-destructive" : ""}`}>
                          {p.type === "REFUND" ? "− " : ""}
                          {formatCurrency(p.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={pays.page} pageCount={pays.pageCount} total={pays.total} pageSize={pays.pageSize} onPageChange={pays.setPage} />
              </>
            )}
          </TableCard>
        </TabsContent>
      </Tabs>

      <InvoiceFormDialog
        open={form.open}
        onOpenChange={(o) => setForm((s) => ({ ...s, open: o }))}
        invoice={form.value}
        patients={patients}
        services={services}
        treatments={treatments}
        defaultTaxRate={taxRate}
      />
      <CollectPaymentDialog open={Boolean(collect)} onOpenChange={(o) => !o && setCollect(null)} invoice={collect} />
      <PaymentDialog open={Boolean(pay.invoice)} onOpenChange={(o) => !o && setPay((s) => ({ ...s, invoice: null }))} invoice={pay.invoice} defaultType={pay.type} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === "cancel" ? `Cancel invoice ${confirm.invoice.number}?` : `Delete invoice ${confirm?.invoice.number ?? ""}?`}
        description={confirm?.kind === "cancel" ? "The invoice stays on record as cancelled and can no longer be paid." : "This action cannot be undone."}
        confirmLabel={confirm?.kind === "cancel" ? "Cancel invoice" : "Delete"}
        onConfirm={runConfirm}
      />
    </>
  );
}

/** Receipt email status for a payment row, with the Ethereal preview link in test mode. */
function ReceiptCell({ receipt }: { receipt?: ReceiptEmailResult }) {
  if (!receipt) return <span className="text-muted-foreground">—</span>;
  if (receipt.status === "SENT") {
    return receipt.previewUrl ? (
      <a href={receipt.previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline" title={`Emailed to ${receipt.to}`}>
        <MailCheck className="size-3.5" aria-hidden /> Emailed · view
      </a>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700" title={`Emailed to ${receipt.to}`}>
        <MailCheck className="size-3.5" aria-hidden /> Emailed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={receipt.error}>
      <MailX className="size-3.5" aria-hidden /> {receipt.status === "SKIPPED" ? "No email" : "Failed"}
    </span>
  );
}
