import type {
  AppointmentStatus,
  GalleryCategory,
  InvoiceStatus,
  LeadStatus,
  PaymentMethod,
  TestimonialStatus,
  ToothCondition,
  TreatmentStatus,
} from "@/types";

type Tone = { label: string; color: string; bg: string };

/** Single source of truth for appointment status labels & calendar colours. */
export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, Tone & { calendar: string }> = {
  PENDING: { label: "Pending", color: "var(--status-pending)", bg: "var(--status-pending-bg)", calendar: "#64748b" },
  CONFIRMED: { label: "Confirmed", color: "var(--status-confirmed)", bg: "var(--status-confirmed-bg)", calendar: "#1f5ad6" },
  COMPLETED: { label: "Completed", color: "var(--status-completed)", bg: "var(--status-completed-bg)", calendar: "#16874f" },
  CANCELLED: { label: "Cancelled", color: "var(--status-cancelled)", bg: "var(--status-cancelled-bg)", calendar: "#d23b3b" },
  NO_SHOW: { label: "No-show", color: "var(--status-noshow)", bg: "var(--status-noshow-bg)", calendar: "#c28a12" },
  RESCHEDULED: { label: "Rescheduled", color: "var(--status-rescheduled)", bg: "var(--status-rescheduled-bg)", calendar: "#7c4ddb" },
};

/** Allowed appointment status transitions (shared by UI and API). */
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "RESCHEDULED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"],
  RESCHEDULED: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"],
  NO_SHOW: ["RESCHEDULED", "CANCELLED"],
  CANCELLED: ["PENDING"],
  COMPLETED: [],
};

/** Statuses that occupy a slot in the schedule. */
export const BLOCKING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "NO_SHOW"];

export const TREATMENT_STATUS_META: Record<TreatmentStatus, Tone> = {
  PLANNED: { label: "Planned", color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
  IN_PROGRESS: { label: "In progress", color: "var(--status-confirmed)", bg: "var(--status-confirmed-bg)" },
  COMPLETED: { label: "Completed", color: "var(--status-completed)", bg: "var(--status-completed-bg)" },
  CANCELLED: { label: "Cancelled", color: "var(--status-cancelled)", bg: "var(--status-cancelled-bg)" },
};

export const INVOICE_STATUS_META: Record<InvoiceStatus, Tone> = {
  DRAFT: { label: "Draft", color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
  UNPAID: { label: "Unpaid", color: "var(--status-cancelled)", bg: "var(--status-cancelled-bg)" },
  PARTIAL: { label: "Partially paid", color: "var(--status-noshow)", bg: "var(--status-noshow-bg)" },
  PAID: { label: "Paid", color: "var(--status-completed)", bg: "var(--status-completed-bg)" },
  REFUNDED: { label: "Refunded", color: "var(--status-rescheduled)", bg: "var(--status-rescheduled-bg)" },
  CANCELLED: { label: "Cancelled", color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
};

export const LEAD_STATUS_META: Record<LeadStatus, Tone> = {
  NEW: { label: "New", color: "var(--status-confirmed)", bg: "var(--status-confirmed-bg)" },
  CONTACTED: { label: "Contacted", color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
  FOLLOW_UP: { label: "Follow-up", color: "var(--status-noshow)", bg: "var(--status-noshow-bg)" },
  CONVERTED: { label: "Converted", color: "var(--status-completed)", bg: "var(--status-completed-bg)" },
  LOST: { label: "Lost", color: "var(--status-cancelled)", bg: "var(--status-cancelled-bg)" },
};

export const TESTIMONIAL_STATUS_META: Record<TestimonialStatus, Tone> = {
  APPROVED: { label: "Approved", color: "var(--status-completed)", bg: "var(--status-completed-bg)" },
  PENDING: { label: "Pending review", color: "var(--status-noshow)", bg: "var(--status-noshow-bg)" },
  HIDDEN: { label: "Hidden", color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  ONLINE: "Online",
};

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  CLINIC: "Clinic",
  TEAM: "Team",
  TREATMENTS: "Treatments",
  EQUIPMENT: "Equipment",
  EVENTS: "Events",
};

export const TOOTH_CONDITION_META: Record<ToothCondition, { label: string; fill: string; stroke: string; short: string }> = {
  HEALTHY: { label: "Healthy", fill: "#ffffff", stroke: "#c9d3e1", short: "" },
  DECAY: { label: "Decay", fill: "#fde2e2", stroke: "#d23b3b", short: "D" },
  FILLED: { label: "Filled", fill: "#dfe9fd", stroke: "#1f5ad6", short: "F" },
  MISSING: { label: "Missing", fill: "#eef1f5", stroke: "#94a3b8", short: "M" },
  CROWN: { label: "Crown", fill: "#fdf1d6", stroke: "#b7791f", short: "C" },
  ROOT_CANAL: { label: "Root canal", fill: "#efe7fd", stroke: "#7c4ddb", short: "RC" },
  IMPLANT: { label: "Implant", fill: "#dcf3f2", stroke: "#0f9b9a", short: "I" },
  EXTRACTION_REQUIRED: { label: "Extraction required", fill: "#ffe8d6", stroke: "#dd6b20", short: "X" },
};

/** FDI numbering, drawn in the patient's-mouth orientation as dentists read it. */
export const UPPER_TEETH = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
export const LOWER_TEETH = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/dentists", label: "Dentists" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const PAGE_SIZE = 10;
