import { CalendarDays, Clock, Phone, Stethoscope, Tooth } from "@/components/booking/icons";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { BookingDentist, BookingService } from "./types";

export function BookingSummary({
  service,
  dentist,
  date,
  time,
  clinicPhone,
}: {
  service?: BookingService;
  dentist?: BookingDentist;
  date?: string;
  time?: string;
  clinicPhone: string;
}) {
  const rows = [
    { Icon: Tooth, label: "Treatment", value: service ? service.name : "Not selected" },
    { Icon: Stethoscope, label: "Dentist", value: dentist?.name ?? "Not selected" },
    { Icon: CalendarDays, label: "Date", value: date ? formatDate(date, "EEE, d MMM yyyy") : "Not selected" },
    { Icon: Clock, label: "Time", value: time ? formatTime(time) : "Not selected" },
  ];
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Booking summary">
      <div className="rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold">Your appointment</h2>
        <ul className="mt-4 space-y-3.5">
          {rows.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className={value === "Not selected" ? "text-sm text-muted-foreground/70" : "text-sm font-medium"}>{value}</span>
              </span>
            </li>
          ))}
        </ul>
        {service && (
          <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Starting from</span>
            <span className="font-semibold">{formatCurrency(service.price)}</span>
          </div>
        )}
      </div>
      <p className="mt-4 flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <Phone className="size-4" aria-hidden />
        Prefer to call? <a href={`tel:${clinicPhone.replace(/\s/g, "")}`} className="font-medium text-foreground hover:underline">{clinicPhone}</a>
      </p>
    </aside>
  );
}
