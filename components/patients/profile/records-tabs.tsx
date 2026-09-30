"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarPlus, ExternalLink, FileText, IndianRupee, MoreHorizontal, Pencil, Plus, Printer, ReceiptText, RotateCcw, Trash2, Wallet } from "lucide-react";
import type { Treatment } from "@/types";
import type { AppointmentView, InvoiceView, PatientProfile } from "@/types/views";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppointmentStatusBadge, InvoiceStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TreatmentCard } from "@/components/clinical/treatment-card";
import { useDeletePrescription } from "@/lib/query";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AppointmentsTab({ appointments, onOpen, onNew }: { appointments: AppointmentView[]; onOpen: (id: string) => void; onNew: () => void }) {
  return (
    <Panel
      title="Appointment history"
      action={
        <Button size="sm" variant="outline" onClick={onNew}>
          <CalendarPlus /> Book
        </Button>
      }
    >
      {appointments.length === 0 ? (
        <EmptyState title="No appointments yet" description="Book this patient's first appointment." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Dentist</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => onOpen(a.id)}>
                <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                <TableCell>
                  {formatDate(a.date)} <span className="text-muted-foreground">· {formatTime(a.time)}</span>
                </TableCell>
                <TableCell>{a.serviceName}</TableCell>
                <TableCell className="text-muted-foreground">{a.dentistName}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground">{a.reason}</TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={a.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}

export function TreatmentsTab({
  treatments,
  onNew,
  onEdit,
  onDelete,
  onChanged,
}: {
  treatments: PatientProfile["treatments"];
  onNew: () => void;
  onEdit: (t: Treatment) => void;
  onDelete: (t: Treatment) => void;
  onChanged: () => void;
}) {
  if (!treatments.length) {
    return (
      <div className="rounded-xl border bg-white">
        <EmptyState
          title="No treatment plans"
          description="Create a plan with steps such as consultation, X-ray and follow-up."
          action={
            <Button onClick={onNew}>
              <Plus /> New treatment plan
            </Button>
          }
        />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew}>
          <Plus /> New treatment plan
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {treatments.map((t) => (
          <TreatmentCard key={t.id} treatment={t} dentistName={t.dentistName} onChanged={onChanged} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
        ))}
      </div>
    </div>
  );
}

export function PrescriptionsTab({
  prescriptions,
  onNew,
  onEdit,
  onChanged,
}: {
  prescriptions: PatientProfile["prescriptions"];
  onNew: () => void;
  onEdit: (p: PatientProfile["prescriptions"][number]) => void;
  onChanged: () => void;
}) {
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const deletePrescription = useDeletePrescription();
  const remove = async (id: string) => {
    await deletePrescription.mutateAsync(id);
    onChanged();
  };
  return (
    <Panel
      title="Prescriptions"
      action={
        <Button size="sm" variant="outline" onClick={onNew}>
          <Plus /> New
        </Button>
      }
    >
      {prescriptions.length === 0 ? (
        <EmptyState icon={FileText} title="No prescriptions" description="Prescriptions written for this patient will appear here." />
      ) : (
        <ul className="divide-y">
          {prescriptions.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{p.diagnosis}</p>
                <p className="text-xs text-muted-foreground">
                  {p.id} · {formatDate(p.date)} · {p.dentistName}
                </p>
                <p className="mt-1.5 truncate text-sm text-muted-foreground">{p.medicines.map((m) => m.name).join(", ")}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/print/prescriptions/${p.id}`} target="_blank">
                    <Printer /> View / print
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${p.id}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(p)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p.id)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete prescription?" onConfirm={() => remove(deleting!)} />
    </Panel>
  );
}

/** COLLECT = UPI QR / cash dialog; PAYMENT / REFUND = the detailed payment form. */
export type PayAction = "COLLECT" | "PAYMENT" | "REFUND";

export function InvoiceActions({
  invoice,
  onEdit,
  onPay,
}: {
  invoice: InvoiceView;
  onEdit: (i: InvoiceView) => void;
  onPay: (i: InvoiceView, type: PayAction) => void;
}) {
  const closed = invoice.status === "CANCELLED";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${invoice.number}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/print/invoices/${invoice.id}`} target="_blank">
            <ExternalLink /> View / print
          </Link>
        </DropdownMenuItem>
        {!closed && invoice.balance > 0 && invoice.status !== "DRAFT" && (
          <>
            <DropdownMenuItem onSelect={() => onPay(invoice, "COLLECT")}>
              <IndianRupee /> Collect payment
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onPay(invoice, "PAYMENT")}>
              <Wallet /> Record other payment
            </DropdownMenuItem>
          </>
        )}
        {!closed && invoice.paid > 0 && (
          <DropdownMenuItem onSelect={() => onPay(invoice, "REFUND")}>
            <RotateCcw /> Issue refund
          </DropdownMenuItem>
        )}
        {!closed && (
          <DropdownMenuItem onSelect={() => onEdit(invoice)}>
            <Pencil /> Edit invoice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BillingTab({
  invoices,
  summary,
  onNew,
  onEdit,
  onPay,
}: {
  invoices: InvoiceView[];
  summary: PatientProfile["summary"];
  onNew: () => void;
  onEdit: (i: InvoiceView) => void;
  onPay: (i: InvoiceView, type: PayAction) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total billed", summary.totalBilled],
          ["Total paid (net)", summary.totalPaid],
          ["Outstanding", summary.outstanding],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(v as number)}</p>
          </div>
        ))}
      </div>
      <Panel
        title="Invoices"
        action={
          <Button size="sm" variant="outline" onClick={onNew}>
            <ReceiptText /> New invoice
          </Button>
        }
      >
        {invoices.length === 0 ? (
          <EmptyState title="No invoices" description="Create an invoice from services or treatment plans." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.number}</TableCell>
                  <TableCell>{formatDate(i.date)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">{i.items.map((x) => x.description).join(", ")}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(i.total)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(i.paid)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatCurrency(i.balance)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <InvoiceActions invoice={i} onEdit={onEdit} onPay={onPay} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
