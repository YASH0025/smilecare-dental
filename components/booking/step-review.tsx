"use client";

import { Info } from "lucide-react";
import type { BookingInput } from "@/lib/validations/appointment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { BookingDentist, BookingService } from "./types";

export function StepReview({ values, service, dentist }: { values: BookingInput; service: BookingService; dentist: BookingDentist }) {
  const rows = [
    ["Treatment", `${service.name} · ${service.duration} min`],
    ["Dentist", dentist.name],
    ["Date", formatDate(values.date, "EEEE, d MMMM yyyy")],
    ["Time", formatTime(values.time)],
    ["Patient", values.fullName],
    ["Mobile", values.phone],
    ["Email", values.email],
    ["Date of birth", formatDate(values.dateOfBirth)],
    ["Reason", values.reason],
    ...(values.notes ? [["Notes", values.notes]] : []),
    ["Starting price", formatCurrency(service.price)],
  ];
  return (
    <div className="space-y-5">
      <dl className="divide-y rounded-lg border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[130px_1fr] gap-3 px-4 py-3 text-sm sm:grid-cols-[160px_1fr]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <Alert variant="info">
        <Info />
        <AlertDescription>
          <p>
            Your request is sent to the clinic as <strong>Pending</strong>. Our team will confirm it shortly by phone or SMS.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
