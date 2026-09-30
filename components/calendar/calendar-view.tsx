"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { addMinutes, format, parse } from "date-fns";
import type { DatesSetArg, EventInput } from "@fullcalendar/core";
import { CalendarSearch, ChevronLeft, ChevronRight, Filter, Plus, Search, X } from "lucide-react";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/types";
import type { AppointmentView } from "@/types/views";
import type { BookingDentist, BookingService } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentDetailSheet } from "@/components/appointments/appointment-detail-sheet";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { APPOINTMENT_STATUS_META } from "@/lib/constants";
import { combineQueries, useAppointments, useLookups } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CalendarSkeleton } from "@/components/shared/skeletons";
import type { CalendarViewName, ClinicCalendarHandle } from "./clinic-calendar";

const ClinicCalendar = dynamic(() => import("./clinic-calendar"), {
  ssr: false,
  loading: () => <Skeleton className="h-[640px] w-full rounded-xl" />,
});

const VIEWS: { value: CalendarViewName; label: string }[] = [
  { value: "dayGridMonth", label: "Month" },
  { value: "timeGridWeek", label: "Week" },
  { value: "timeGridDay", label: "Day" },
  { value: "listWeek", label: "Agenda" },
];

/** Fetches appointments + lookups, then renders the board (skeleton / error handled by RenderContent). */
export function CalendarView({ initialDate, focusId }: { initialDate?: string; focusId?: string }) {
  const query = combineQueries(useAppointments(), useLookups());
  return (
    <RenderContent query={query} loading={<CalendarSkeleton />} errorTitle="Couldn't load the calendar">
      {([appointments, lookups]) => (
        <CalendarBoard
          appointments={appointments}
          services={lookups.services}
          dentists={lookups.dentists}
          patients={lookups.patients}
          initialDate={initialDate}
          focusId={focusId}
        />
      )}
    </RenderContent>
  );
}

function CalendarBoard({
  appointments,
  services,
  dentists,
  patients,
  initialDate,
  focusId,
}: {
  appointments: AppointmentView[];
  services: BookingService[];
  dentists: BookingDentist[];
  patients: PatientOption[];
  initialDate?: string;
  focusId?: string;
}) {
  const pathname = usePathname();
  const calRef = React.useRef<ClinicCalendarHandle>(null);
  const [title, setTitle] = React.useState("");
  const [view, setView] = React.useState<CalendarViewName>("timeGridWeek");
  const [ready, setReady] = React.useState(false);
  const [dentistId, setDentistId] = React.useState("ALL");
  const [serviceId, setServiceId] = React.useState("ALL");
  const [statuses, setStatuses] = React.useState<AppointmentStatus[]>([...APPOINTMENT_STATUSES]);
  const [q, setQ] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(focusId ?? null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDefaults, setCreateDefaults] = React.useState<{ date?: string; time?: string }>({});

  // Mobile-friendly default view.
  React.useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setView(mobile ? "listWeek" : "timeGridWeek");
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (ready) calRef.current?.changeView(view);
  }, [view, ready]);

  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return appointments.filter(
      (a) =>
        (dentistId === "ALL" || a.dentistId === dentistId) &&
        (serviceId === "ALL" || a.serviceId === serviceId) &&
        statuses.includes(a.status) &&
        (!needle || a.patientName.toLowerCase().includes(needle) || a.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, "")) || a.id.toLowerCase().includes(needle)),
    );
  }, [appointments, dentistId, serviceId, statuses, q]);

  const events: EventInput[] = React.useMemo(
    () =>
      filtered.map((a) => {
        const start = parse(`${a.date} ${a.time}`, "yyyy-MM-dd HH:mm", new Date());
        const meta = APPOINTMENT_STATUS_META[a.status];
        return {
          id: a.id,
          title: a.patientName,
          start,
          end: addMinutes(start, a.duration),
          backgroundColor: `color-mix(in srgb, ${meta.calendar} 14%, white)`,
          borderColor: meta.calendar,
          textColor: "#0b1b34",
          classNames: [`status-${a.status.toLowerCase()}`, a.status === "CANCELLED" ? "line-through opacity-70" : ""],
          extendedProps: { serviceName: a.serviceName, dentistName: a.dentistName, status: a.status },
        };
      }),
    [filtered],
  );

  const filtersActive = dentistId !== "ALL" || serviceId !== "ALL" || statuses.length !== APPOINTMENT_STATUSES.length || q !== "";

  function openAppointment(id: string) {
    setSelectedId(id);
    const a = appointments.find((x) => x.id === id);
    if (a) window.history.replaceState(null, "", `${pathname}?date=${a.date}&id=${id}`);
  }

  function closeSheet(open: boolean) {
    if (!open) {
      setSelectedId(null);
      window.history.replaceState(null, "", pathname);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters: one row above the calendar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center">
        <div className="relative lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, phone, ID" className="pl-9" aria-label="Search patient" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Select value={dentistId} onValueChange={setDentistId}>
            <SelectTrigger className="sm:w-[180px]" aria-label="Filter by dentist">
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
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger className="sm:w-[190px]" aria-label="Filter by service">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All services</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Filter />
                Status
                {statuses.length !== APPOINTMENT_STATUSES.length && (
                  <span className="rounded bg-accent px-1.5 text-xs text-accent-foreground">{statuses.length}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Show statuses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {APPOINTMENT_STATUSES.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statuses.includes(s)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(c) => setStatuses((prev) => (c ? [...prev, s] : prev.filter((x) => x !== s)))}
                >
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: APPOINTMENT_STATUS_META[s].calendar }} aria-hidden />
                  {APPOINTMENT_STATUS_META[s].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarSearch />
                Go to date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" onSelect={(d) => d && calRef.current?.gotoDate(d)} />
            </PopoverContent>
          </Popover>
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                setDentistId("ALL");
                setServiceId("ALL");
                setStatuses([...APPOINTMENT_STATUSES]);
                setQ("");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </div>
        <Button
          className="lg:ml-auto"
          onClick={() => {
            setCreateDefaults({});
            setCreateOpen(true);
          }}
        >
          <Plus /> New appointment
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-3 shadow-[var(--shadow-soft)] sm:p-4">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => calRef.current?.today()}>
              Today
            </Button>
            <div className="flex">
              <Button variant="ghost" size="icon-sm" onClick={() => calRef.current?.prev()} aria-label="Previous period">
                <ChevronLeft />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => calRef.current?.next()} aria-label="Next period">
                <ChevronRight />
              </Button>
            </div>
            <h2 className="text-base font-semibold sm:text-lg" aria-live="polite">
              {title}
            </h2>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewName)}>
            <TabsList className="w-full sm:w-auto">
              {VIEWS.map((v) => (
                <TabsTrigger key={v.value} value={v.value}>
                  {v.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {ready ? (
          <ClinicCalendar
            apiRef={calRef}
            events={events}
            initialView={view}
            initialDate={initialDate}
            onEventClick={openAppointment}
            onDateClick={(date, time) => {
              setCreateDefaults({ date, time });
              setCreateOpen(true);
            }}
            onDatesSet={(arg: DatesSetArg) => setTitle(arg.view.title)}
          />
        ) : (
          <Skeleton className="h-[640px] w-full rounded-xl" />
        )}

        {/* Legend */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground" aria-label="Status colours">
          {APPOINTMENT_STATUSES.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: APPOINTMENT_STATUS_META[s].calendar }} aria-hidden />
              {APPOINTMENT_STATUS_META[s].label}
              <span className="tabular-nums text-muted-foreground/70">({filtered.filter((a) => a.status === s).length})</span>
            </li>
          ))}
          <li className="ml-auto hidden sm:block">Showing {filtered.length} of {appointments.length} appointments</li>
        </ul>
      </div>

      <AppointmentDetailSheet appointment={selected} dentists={dentists} open={Boolean(selected)} onOpenChange={closeSheet} />
      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        services={services}
        dentists={dentists}
        patients={patients}
        defaults={{ date: createDefaults.date ?? format(new Date(), "yyyy-MM-dd"), time: createDefaults.time ?? "" }}
        onCreated={() => undefined}
      />
    </div>
  );
}
