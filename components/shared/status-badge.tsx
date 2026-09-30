import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_META,
  INVOICE_STATUS_META,
  LEAD_STATUS_META,
  TESTIMONIAL_STATUS_META,
  TREATMENT_STATUS_META,
} from "@/lib/constants";
import type { AppointmentStatus, InvoiceStatus, LeadStatus, TestimonialStatus, TreatmentStatus } from "@/types";

type Tone = { label: string; color: string; bg: string };

export function ToneBadge({ tone, className, dot = true }: { tone: Tone; className?: string; dot?: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", className)}
      style={{ color: tone.color, backgroundColor: tone.bg }}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ backgroundColor: tone.color }} aria-hidden />}
      {tone.label}
    </span>
  );
}

export const AppointmentStatusBadge = ({ status, className }: { status: AppointmentStatus; className?: string }) => (
  <ToneBadge tone={APPOINTMENT_STATUS_META[status]} className={className} />
);
export const TreatmentStatusBadge = ({ status }: { status: TreatmentStatus }) => <ToneBadge tone={TREATMENT_STATUS_META[status]} />;
export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => <ToneBadge tone={INVOICE_STATUS_META[status]} />;
export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => <ToneBadge tone={LEAD_STATUS_META[status]} />;
export const TestimonialStatusBadge = ({ status }: { status: TestimonialStatus }) => <ToneBadge tone={TESTIMONIAL_STATUS_META[status]} />;

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <ToneBadge
      tone={
        published
          ? { label: "Published", color: "var(--status-completed)", bg: "var(--status-completed-bg)" }
          : { label: "Draft", color: "var(--status-pending)", bg: "var(--status-pending-bg)" }
      }
    />
  );
}
