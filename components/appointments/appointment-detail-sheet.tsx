"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarX2,
  Check,
  CheckCheck,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Stethoscope,
  UserRound,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { AppointmentStatus } from "@/types";
import type { AppointmentView } from "@/types/views";
import type { BookingDentist } from "@/components/booking/types";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppointmentStatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { APPOINTMENT_STATUS_META, APPOINTMENT_TRANSITIONS } from "@/lib/constants";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import { RescheduleDialog } from "./reschedule-dialog";
import { useAppointmentMutations } from "./use-appointment-mutations";

const ACTIONS: { status: AppointmentStatus; label: string; icon: LucideIcon; variant: "default" | "outline" | "destructive" }[] = [
  { status: "CONFIRMED", label: "Confirm", icon: Check, variant: "default" },
  { status: "COMPLETED", label: "Mark completed", icon: CheckCheck, variant: "default" },
  { status: "NO_SHOW", label: "Mark no-show", icon: UserX, variant: "outline" },
  { status: "PENDING", label: "Reopen", icon: RotateCcw, variant: "outline" },
];

export function AppointmentDetailSheet({
  appointment,
  dentists,
  open,
  onOpenChange,
  onUpdated,
}: {
  appointment: AppointmentView | null;
  dentists: Pick<BookingDentist, "id" | "workingHours" | "leaves">[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpdated?: (a: AppointmentView) => void;
}) {
  const { changeStatus, reschedule, pending } = useAppointmentMutations(onUpdated);
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const a = appointment;
  const allowed = a ? APPOINTMENT_TRANSITIONS[a.status] : [];
  const dentist = dentists.find((d) => d.id === a?.dentistId);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 overflow-y-auto sm:max-w-md">
          {a && (
            <>
              <SheetHeader className="border-b">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: APPOINTMENT_STATUS_META[a.status].calendar }} aria-hidden />
                  <span className="text-xs font-medium text-muted-foreground">{a.id}</span>
                </div>
                <SheetTitle className="text-lg">{a.patientName}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <AppointmentStatusBadge status={a.status} /> <span>via {a.source.toLowerCase().replace("_", "-")}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 p-5">
                <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" aria-hidden /> Date
                  </dt>
                  <dd className="font-medium">{formatDate(a.date, "EEEE, d MMM yyyy")}</dd>
                  <dt className="pl-6 text-muted-foreground">Time</dt>
                  <dd className="font-medium">
                    {formatTime(a.time)} · {a.duration} min
                  </dd>
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="size-4" aria-hidden /> Service
                  </dt>
                  <dd className="font-medium">{a.serviceName}</dd>
                  <dt className="pl-6 text-muted-foreground">Dentist</dt>
                  <dd className="font-medium">{a.dentistName}</dd>
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" aria-hidden /> Phone
                  </dt>
                  <dd>
                    <a className="font-medium hover:text-primary" href={`tel:${a.phone.replace(/\s/g, "")}`}>
                      {a.phone}
                    </a>
                  </dd>
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" aria-hidden /> Email
                  </dt>
                  <dd className="truncate">{a.email || "—"}</dd>
                </dl>

                <div className="rounded-lg border bg-canvas p-4 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">Reason for visit</p>
                  <p className="mt-1">{a.reason || "—"}</p>
                  {a.notes && (
                    <>
                      <p className="mt-3 text-xs font-medium text-muted-foreground">Notes</p>
                      <p className="mt-1 whitespace-pre-line">{a.notes}</p>
                    </>
                  )}
                </div>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/admin/patients/${a.patientId}`}>
                    <UserRound /> Open patient profile
                  </Link>
                </Button>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold">History</h3>
                  <ol className="mt-3 space-y-3">
                    {[...a.history].reverse().map((h, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ backgroundColor: APPOINTMENT_STATUS_META[h.status].calendar }} aria-hidden />
                        <span>
                          <span className="font-medium">{APPOINTMENT_STATUS_META[h.status].label}</span>
                          {h.note && <span className="text-muted-foreground"> — {h.note}</span>}
                          <span className="block text-xs text-muted-foreground">{formatDateTime(h.at)}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <SheetFooter className="sticky bottom-0 border-t bg-white">
                {allowed.length === 0 && <p className="text-center text-sm text-muted-foreground">This appointment is closed. No further actions.</p>}
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.filter((x) => allowed.includes(x.status)).map((x) => {
                    const busy = pending === `${a.id}:${x.status}`;
                    return (
                      <Button key={x.status} variant={x.variant} disabled={Boolean(pending)} onClick={() => changeStatus(a.id, x.status).catch(() => undefined)}>
                        {busy ? <Loader2 className="animate-spin" /> : <x.icon />}
                        {x.label}
                      </Button>
                    );
                  })}
                  {allowed.includes("RESCHEDULED") && (
                    <Button variant="outline" disabled={Boolean(pending)} onClick={() => setRescheduleOpen(true)}>
                      <CalendarClock /> Reschedule
                    </Button>
                  )}
                  {allowed.includes("CANCELLED") && (
                    <Button variant="outline" className="text-destructive hover:text-destructive" disabled={Boolean(pending)} onClick={() => setCancelOpen(true)}>
                      <CalendarX2 /> Cancel
                    </Button>
                  )}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <RescheduleDialog
        appointment={a}
        dentist={dentist}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        onSubmit={(date, time, note) => reschedule(a!.id, date, time, note)}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment?"
        description={a ? `${a.patientName}'s appointment on ${formatDate(a.date)} at ${formatTime(a.time)} will be cancelled and the slot released.` : ""}
        confirmLabel="Cancel appointment"
        onConfirm={() => changeStatus(a!.id, "CANCELLED")}
      />
    </>
  );
}
