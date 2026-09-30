"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Pill, Plus, Printer, Trash2 } from "lucide-react";
import type { ClinicSettings, Prescription } from "@/types";
import type { PrescriptionView } from "@/types/views";
import type { BookingDentist } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PrescriptionFormDialog } from "@/components/forms/prescription-form-dialog";
import { combineQueries, useDeletePrescription, useLookups, usePrescriptions, useSettings } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import { formatDate } from "@/lib/utils";
import { PrescriptionDocument } from "./prescription-document";

export function PrescriptionsScreen() {
  const query = combineQueries(usePrescriptions(), useLookups(), useSettings());
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load prescriptions"
      loading={
        <>
          <PageHeader title="Prescriptions" description="Loading prescriptions…" />
          <TableSkeleton columns={7} />
        </>
      }
    >
      {([items, lookups, clinic]) => <PrescriptionsTable items={items} patients={lookups.patients} dentists={lookups.dentists} clinic={clinic} />}
    </RenderContent>
  );
}

function PrescriptionsTable({
  items,
  patients,
  dentists,
  clinic,
}: {
  items: PrescriptionView[];
  patients: PatientOption[];
  dentists: BookingDentist[];
  clinic: ClinicSettings;
}) {
  const deletePrescription = useDeletePrescription();
  const [q, setQ] = React.useState("");
  const [dentistId, setDentistId] = React.useState("ALL");
  const [form, setForm] = React.useState<{ open: boolean; value: Prescription | null }>({ open: false, value: null });
  const [viewing, setViewing] = React.useState<PrescriptionView | null>(null);
  const [deleting, setDeleting] = React.useState<PrescriptionView | null>(null);

  const needle = q.toLowerCase().trim();
  const filtered = items.filter(
    (r) =>
      (dentistId === "ALL" || r.dentistId === dentistId) &&
      (!needle ||
        r.patientName.toLowerCase().includes(needle) ||
        r.diagnosis.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        r.medicines.some((m) => m.name.toLowerCase().includes(needle))),
  );
  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(filtered);

  const remove = (r: PrescriptionView) => deletePrescription.mutateAsync(r.id);

  return (
    <>
      <PageHeader
        title="Prescriptions"
        description="Create, edit and print prescriptions."
        actions={
          <Button onClick={() => setForm({ open: true, value: null })}>
            <Plus /> New prescription
          </Button>
        }
      />
      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search patient, diagnosis, medicine">
          <Select value={dentistId} onValueChange={setDentistId}>
            <SelectTrigger className="w-[190px]" aria-label="Filter by dentist">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All dentists</SelectItem>
              {dentists.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DataToolbar>
        {filtered.length === 0 ? (
          <EmptyState icon={Pill} title="No prescriptions found" description="Try a different search, or create a new prescription." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rx no.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>
                      <Link href={`/admin/patients/${r.patientId}?tab=prescriptions`} className="font-medium hover:text-primary">
                        {r.patientName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{r.diagnosis}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground">{r.medicines.map((m) => m.name).join(", ")}</TableCell>
                    <TableCell className="text-muted-foreground">{r.dentistName}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.id}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setViewing(r)}>
                            <Eye /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/print/prescriptions/${r.id}`} target="_blank">
                              <Printer /> Print
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setForm({ open: true, value: r })}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(r)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </TableCard>

      <Dialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-canvas sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prescription {viewing?.id}</DialogTitle>
            <DialogDescription>Preview · use Print for a clean A4 copy.</DialogDescription>
          </DialogHeader>
          {viewing && <PrescriptionDocument rx={viewing} clinic={clinic} />}
          <div className="flex justify-end">
            <Button asChild>
              <Link href={`/admin/print/prescriptions/${viewing?.id}`} target="_blank">
                <Printer /> Print
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrescriptionFormDialog
        open={form.open}
        onOpenChange={(o) => setForm((s) => ({ ...s, open: o }))}
        prescription={form.value}
        patients={patients}
        dentists={dentists}
      />
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title={`Delete prescription ${deleting?.id ?? ""}?`} onConfirm={() => remove(deleting!)} />
    </>
  );
}
