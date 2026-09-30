"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarClock, CalendarX2, Check, CheckCheck, Eye, MoreHorizontal, Plus, Trash2, UserX, X } from "lucide-react";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/types";
import type { AppointmentView } from "@/types/views";
import type { BookingDentist, BookingService } from "@/components/booking/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { AppointmentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { APPOINTMENT_STATUS_META, APPOINTMENT_TRANSITIONS } from "@/lib/constants";
import { combineQueries, useAppointments, useDeleteAppointment, useLookups } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import { formatDate, formatTime } from "@/lib/utils";
import { AppointmentDetailSheet } from "./appointment-detail-sheet";
import { AppointmentFormDialog, type PatientOption } from "./appointment-form-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { useAppointmentMutations } from "./use-appointment-mutations";

type Range = "upcoming" | "today" | "past" | "all";

type Props = { initialStatus?: string; initialQuery?: string; openCreate?: boolean };

/** Loads appointments + lookups with TanStack Query; RenderContent handles loading/error. */
export function AppointmentsTable(props: Props) {
  const query = combineQueries(useAppointments(), useLookups());
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load appointments"
      loading={
        <>
          <PageHeader title="Appointments" description="All bookings from the website, phone and walk-ins." />
          <TableSkeleton columns={8} />
        </>
      }
    >
      {([appointments, lookups]) => (
        <AppointmentsBoard
          {...props}
          appointments={appointments}
          services={lookups.services}
          dentists={lookups.dentists}
          patients={lookups.patients}
        />
      )}
    </RenderContent>
  );
}

function AppointmentsBoard({
  appointments: rows,
  services,
  dentists,
  patients,
  initialStatus,
  initialQuery,
  openCreate,
}: {
  appointments: AppointmentView[];
  services: BookingService[];
  dentists: BookingDentist[];
  patients: PatientOption[];
  initialStatus?: string;
  initialQuery?: string;
  openCreate?: boolean;
}) {
  const [q, setQ] = React.useState(initialQuery ?? "");
  const [status, setStatus] = React.useState<string>(initialStatus && APPOINTMENT_STATUSES.includes(initialStatus as AppointmentStatus) ? initialStatus : "ALL");
  const [dentistId, setDentistId] = React.useState("ALL");
  const [range, setRange] = React.useState<Range>(initialQuery ? "all" : initialStatus ? "all" : "upcoming");
  const [viewing, setViewing] = React.useState<string | null>(null);
  const [rescheduling, setRescheduling] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(Boolean(openCreate));

  const { changeStatus, reschedule } = useAppointmentMutations();
  const deleteAppointment = useDeleteAppointment();

  const today = format(new Date(), "yyyy-MM-dd");
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter(
      (a) =>
        (status === "ALL" || a.status === status) &&
        (dentistId === "ALL" || a.dentistId === dentistId) &&
        (range === "all" || (range === "today" && a.date === today) || (range === "upcoming" && a.date >= today) || (range === "past" && a.date < today)) &&
        (!needle ||
          a.patientName.toLowerCase().includes(needle) ||
          a.id.toLowerCase().includes(needle) ||
          a.serviceName.toLowerCase().includes(needle) ||
          a.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))),
    );
    list = range === "past" || range === "all" ? [...list].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)) : list;
    return list;
  }, [rows, q, status, dentistId, range, today]);

  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(filtered);
  const find = (id: string | null) => rows.find((r) => r.id === id) ?? null;
  const filtersActive = q || status !== "ALL" || dentistId !== "ALL";

  const remove = (id: string) => deleteAppointment.mutateAsync(id);

  return (
    <>
      <PageHeader
        title="Appointments"
        description="All bookings from the website, phone and walk-ins."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New appointment
          </Button>
        }
      />

      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search patient, phone, ID, service">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {APPOINTMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {APPOINTMENT_STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dentistId} onValueChange={setDentistId}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by dentist">
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
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setStatus("ALL");
                setDentistId("ALL");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </DataToolbar>

        {filtered.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="You don't have any appointments matching the selected filters."
            action={
              filtersActive || range !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setStatus("ALL");
                    setDentistId("ALL");
                    setRange("all");
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
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => {
                  const allowed = APPOINTMENT_TRANSITIONS[a.status];
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                      <TableCell>
                        <button onClick={() => setViewing(a.id)} className="text-left font-medium hover:text-primary">
                          {a.patientName}
                        </button>
                        <span className="block text-xs text-muted-foreground">{a.phone}</span>
                      </TableCell>
                      <TableCell>{a.serviceName}</TableCell>
                      <TableCell className="text-muted-foreground">{a.dentistName}</TableCell>
                      <TableCell>{formatDate(a.date, "EEE, d MMM yyyy")}</TableCell>
                      <TableCell className="tabular-nums">{formatTime(a.time)}</TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${a.id}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => setViewing(a.id)}>
                              <Eye /> View details
                            </DropdownMenuItem>
                            {allowed.includes("CONFIRMED") && (
                              <DropdownMenuItem onSelect={() => changeStatus(a.id, "CONFIRMED").catch(() => undefined)}>
                                <Check /> Confirm
                              </DropdownMenuItem>
                            )}
                            {allowed.includes("COMPLETED") && (
                              <DropdownMenuItem onSelect={() => changeStatus(a.id, "COMPLETED").catch(() => undefined)}>
                                <CheckCheck /> Mark completed
                              </DropdownMenuItem>
                            )}
                            {allowed.includes("RESCHEDULED") && (
                              <DropdownMenuItem onSelect={() => setRescheduling(a.id)}>
                                <CalendarClock /> Reschedule
                              </DropdownMenuItem>
                            )}
                            {allowed.includes("NO_SHOW") && (
                              <DropdownMenuItem onSelect={() => changeStatus(a.id, "NO_SHOW").catch(() => undefined)}>
                                <UserX /> Mark no-show
                              </DropdownMenuItem>
                            )}
                            {allowed.includes("CANCELLED") && (
                              <DropdownMenuItem variant="destructive" onSelect={() => setCancelling(a.id)}>
                                <CalendarX2 /> Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(a.id)}>
                              <Trash2 /> Delete record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </TableCard>

      <AppointmentDetailSheet appointment={find(viewing)} dentists={dentists} open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} />
      <RescheduleDialog
        appointment={find(rescheduling)}
        dentist={dentists.find((d) => d.id === find(rescheduling)?.dentistId)}
        open={Boolean(rescheduling)}
        onOpenChange={(o) => !o && setRescheduling(null)}
        onSubmit={(date, time, note) => reschedule(rescheduling!, date, time, note)}
      />
      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(o) => !o && setCancelling(null)}
        title="Cancel appointment?"
        description="The patient's slot will be released. You can reopen it later if needed."
        confirmLabel="Cancel appointment"
        onConfirm={() => changeStatus(cancelling!, "CANCELLED")}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete appointment record?"
        description="This permanently removes the appointment and its history. This action cannot be undone. Prefer cancelling for normal workflow."
        onConfirm={() => remove(deleting!)}
      />
      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o && openCreate) window.history.replaceState(null, "", "/admin/appointments");
        }}
        services={services}
        dentists={dentists}
        patients={patients}
      />
    </>
  );
}
