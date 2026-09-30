"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import type { Patient } from "@/types";
import type { PatientListItem } from "@/types/views";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ToneBadge } from "@/components/shared/status-badge";
import { useDeletePatient, usePatients } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import { formatCurrency, formatDate, formatTime, initials } from "@/lib/utils";
import { PatientFormDialog } from "./patient-form-dialog";

export function PatientsTable({ openCreate }: { openCreate?: boolean }) {
  const query = usePatients();
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load patients"
      loading={
        <>
          <PageHeader title="Patients" description="Loading patient records…" />
          <TableSkeleton columns={9} />
        </>
      }
    >
      {(patients) => <PatientsBoard initialPatients={patients} openCreate={openCreate} />}
    </RenderContent>
  );
}

function PatientsBoard({ initialPatients, openCreate }: { initialPatients: PatientListItem[]; openCreate?: boolean }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [balance, setBalance] = React.useState("ALL");
  const [editing, setEditing] = React.useState<Patient | null>(null);
  const [formOpen, setFormOpen] = React.useState(Boolean(openCreate));
  const [deleting, setDeleting] = React.useState<PatientListItem | null>(null);

  const filtered = initialPatients.filter((p) => {
    const needle = q.trim().toLowerCase();
    return (
      (status === "ALL" || p.status === status) &&
      (balance === "ALL" || (balance === "DUE" ? p.outstanding > 0 : p.nextAppointment !== null)) &&
      (!needle ||
        p.name.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle) ||
        p.email.toLowerCase().includes(needle) ||
        p.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, "")))
    );
  });
  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(filtered);
  const filtersActive = q || status !== "ALL" || balance !== "ALL";

  const deletePatient = useDeletePatient();
  const remove = (p: PatientListItem) => deletePatient.mutateAsync(p.id);

  return (
    <>
      <PageHeader
        title="Patients"
        description={`${initialPatients.length} patients on record`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> New patient
          </Button>
        }
      />
      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search name, phone, email or ID">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All patients</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={balance} onValueChange={setBalance}>
            <SelectTrigger className="w-[190px]" aria-label="Quick filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any appointment/balance</SelectItem>
              <SelectItem value="UPCOMING">Has upcoming visit</SelectItem>
              <SelectItem value="DUE">Has outstanding balance</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setStatus("ALL");
                setBalance("ALL");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </DataToolbar>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description="No patients match the current search or filters."
            action={
              filtersActive ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setStatus("ALL");
                    setBalance("ALL");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead>Next appointment</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                    <TableCell>
                      <Link href={`/admin/patients/${p.id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                        <Avatar className="size-8">
                          <AvatarFallback>{initials(p.name)}</AvatarFallback>
                        </Avatar>
                        <span>
                          {p.name}
                          {p.outstanding > 0 && <span className="block text-xs font-normal text-[var(--status-noshow)]">Due {formatCurrency(p.outstanding)}</span>}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{p.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.email || "—"}</TableCell>
                    <TableCell>{p.lastVisit ? formatDate(p.lastVisit) : "—"}</TableCell>
                    <TableCell>
                      {p.nextAppointment ? (
                        <>
                          {formatDate(p.nextAppointment.date, "d MMM")}
                          <span className="text-muted-foreground"> · {formatTime(p.nextAppointment.time)}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{p.currentTreatment ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <ToneBadge
                        tone={
                          p.status === "ACTIVE"
                            ? { label: "Active", color: "var(--status-completed)", bg: "var(--status-completed-bg)" }
                            : { label: "Inactive", color: "var(--status-pending)", bg: "var(--status-pending-bg)" }
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/patients/${p.id}`}>
                              <Eye /> View profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(p);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}>
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

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editing}
        onSaved={(p) => {
          if (!editing) router.push(`/admin/patients/${p.id}`);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "patient"}?`}
        description="This action cannot be undone. Patients with appointments or invoices can't be deleted — mark them inactive instead."
        onConfirm={() => remove(deleting!)}
      />
    </>
  );
}
