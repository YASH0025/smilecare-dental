"use client";

import Link from "next/link";
import { CalendarCheck2, Home } from "lucide-react";
import type { AppointmentView } from "@/types/views";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatTime } from "@/lib/utils";

export function BookingSuccess({ appointment, clinicPhone }: { appointment: AppointmentView; clinicPhone: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-10" role="status" aria-live="polite">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--status-completed-bg)] text-[var(--status-completed)]">
        <CalendarCheck2 className="size-7" aria-hidden />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">Appointment requested</h2>
      <p className="mt-2 text-muted-foreground">
        Thank you, {appointment.patientName.split(" ")[0]}. We&apos;ve received your request and will confirm it shortly.
      </p>
      <dl className="mt-8 divide-y rounded-lg border text-left text-sm">
        {[
          ["Reference", appointment.id],
          ["Treatment", appointment.serviceName],
          ["Dentist", appointment.dentistName],
          ["When", `${formatDate(appointment.date, "EEE, d MMM yyyy")} at ${formatTime(appointment.time)}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <AppointmentStatusBadge status={appointment.status} />
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">
        Need to change something? Call us on{" "}
        <a href={`tel:${clinicPhone.replace(/\s/g, "")}`} className="font-medium text-foreground">
          {clinicPhone}
        </a>
        .
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/">
            <Home />
            Back to home
          </Link>
        </Button>
        <Button onClick={() => window.location.assign("/book-appointment")}>Book another</Button>
      </div>
    </div>
  );
}
