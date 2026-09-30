/**
 * Domain types for SmileCare. These are persistence-agnostic: the JSON repository
 * stores them as-is today, and a Prisma schema can map 1:1 onto them later.
 */

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentSource = "ONLINE" | "PHONE" | "WALK_IN" | "ADMIN";

export interface AppointmentHistoryEntry {
  at: string;
  status: AppointmentStatus;
  note?: string;
}

export interface Appointment extends BaseEntity {
  patientId: ID;
  patientName: string;
  phone: string;
  email: string;
  serviceId: ID;
  dentistId: ID;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  duration: number; // minutes
  status: AppointmentStatus;
  reason: string;
  notes: string;
  source: AppointmentSource;
  history: AppointmentHistoryEntry[];
}

export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  reason?: "BOOKED" | "PAST" | "BREAK";
}

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

export const TOOTH_CONDITIONS = [
  "HEALTHY",
  "DECAY",
  "FILLED",
  "MISSING",
  "CROWN",
  "ROOT_CANAL",
  "IMPLANT",
  "EXTRACTION_REQUIRED",
] as const;
export type ToothCondition = (typeof TOOTH_CONDITIONS)[number];

export interface ToothRecord {
  condition: ToothCondition;
  notes?: string;
  updatedAt: string;
}

/** Keyed by FDI tooth number (11–48). Missing keys are treated as HEALTHY. */
export type DentalChart = Record<string, ToothRecord>;

export interface PatientNote {
  id: ID;
  text: string;
  author: string;
  createdAt: string;
}

export interface PatientDocument {
  id: ID;
  name: string;
  type: "X_RAY" | "REPORT" | "CONSENT" | "PRESCRIPTION" | "OTHER";
  date: string;
  notes?: string;
}

export type PatientStatus = "ACTIVE" | "INACTIVE";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Patient extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string; // yyyy-MM-dd
  gender: Gender;
  address: string;
  bloodGroup?: string;
  allergies: string;
  medicalHistory: string;
  dentalHistory: string;
  emergencyContact?: string;
  status: PatientStatus;
  dentalChart: DentalChart;
  notes: PatientNote[];
  documents: PatientDocument[];
}

/* ------------------------------------------------------------------ */
/* Clinical                                                            */
/* ------------------------------------------------------------------ */

export const TREATMENT_STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type TreatmentStatus = (typeof TREATMENT_STATUSES)[number];

export interface TreatmentStep {
  id: ID;
  label: string;
  done: boolean;
}

export interface Treatment extends BaseEntity {
  patientId: ID;
  dentistId: ID;
  serviceId?: ID;
  title: string;
  teeth: string[];
  steps: TreatmentStep[];
  cost: number;
  status: TreatmentStatus;
  startDate: string;
  endDate?: string;
  followUpDate?: string;
  notes: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription extends BaseEntity {
  patientId: ID;
  dentistId: ID;
  appointmentId?: ID;
  date: string;
  diagnosis: string;
  medicines: Medicine[];
  advice: string;
}

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

export const INVOICE_STATUSES = ["DRAFT", "UNPAID", "PARTIAL", "PAID", "REFUNDED", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "ONLINE"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface InvoiceItem {
  id: ID;
  description: string;
  treatmentId?: ID;
  serviceId?: ID;
  quantity: number;
  price: number;
  discount: number; // flat amount per line
}

export interface Invoice extends BaseEntity {
  number: string;
  patientId: ID;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number; // percent
  // Derived fields — recomputed by the invoice service on every write.
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  paid: number;
  refunded: number;
  balance: number;
  status: InvoiceStatus;
  notes: string;
}

export interface Payment extends BaseEntity {
  invoiceId: ID;
  patientId: ID;
  amount: number;
  method: PaymentMethod;
  type: "PAYMENT" | "REFUND";
  date: string;
  reference: string;
  notes: string;
  /** Result of the emailed payment receipt (payments only). */
  receipt?: ReceiptEmailResult;
}

export interface ReceiptEmailResult {
  status: "SENT" | "FAILED" | "SKIPPED";
  to: string;
  /** Ethereal preview link when using the test mail service. */
  previewUrl?: string;
  error?: string;
  sentAt: string;
}

/* ------------------------------------------------------------------ */
/* Clinic / CMS                                                        */
/* ------------------------------------------------------------------ */

export interface WorkingDay {
  day: number; // 0 = Sunday … 6 = Saturday
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
  breakStart?: string;
  breakEnd?: string;
}

export interface DentistLeave {
  id: ID;
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
  reason: string;
}

export interface Dentist extends BaseEntity {
  slug: string;
  name: string;
  photo: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  languages: string[];
  serviceIds: ID[];
  workingHours: WorkingDay[];
  leaves: DentistLeave[];
  active: boolean;
}

export interface ServiceStep {
  title: string;
  description: string;
}

export interface FaqPair {
  question: string;
  answer: string;
}

export interface Service extends BaseEntity {
  slug: string;
  name: string;
  category: string;
  description: string;
  content: string;
  duration: number;
  price: number;
  image: string;
  benefits: string[];
  whoNeedsIt: string[];
  procedure: ServiceStep[];
  recovery: string;
  faqs: FaqPair[];
  published: boolean;
  featured: boolean;
}

export interface PortfolioItem extends BaseEntity {
  title: string;
  treatment: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  duration: string;
  dentistId: ID;
  published: boolean;
}

export const GALLERY_CATEGORIES = ["CLINIC", "TEAM", "TREATMENTS", "EQUIPMENT", "EVENTS"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryItem extends BaseEntity {
  title: string;
  category: GalleryCategory;
  image: string;
  description: string;
  order: number;
  published: boolean;
}

export type TestimonialStatus = "APPROVED" | "PENDING" | "HIDDEN";

export interface Testimonial extends BaseEntity {
  patientName: string;
  location: string;
  rating: number;
  review: string;
  treatment: string;
  date: string;
  status: TestimonialStatus;
}

export interface Faq extends BaseEntity {
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export const LEAD_STATUSES = ["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "LOST"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  interestedService: string;
  message: string;
  source: "WEBSITE" | "PHONE" | "WALK_IN" | "REFERRAL" | "SOCIAL";
  status: LeadStatus;
  notes: string;
}

export type NotificationType =
  | "APPOINTMENT_REQUESTED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REMINDER"
  | "NEW_PATIENT"
  | "PAYMENT_RECEIVED"
  | "NEW_LEAD";

export interface AppNotification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  /** Simulated delivery channels — nothing is actually sent yet. */
  channels: ("IN_APP" | "EMAIL" | "SMS" | "WHATSAPP")[];
}

/* ------------------------------------------------------------------ */
/* Settings & website content                                          */
/* ------------------------------------------------------------------ */

export interface OpeningHours {
  label: string; // e.g. "Mon – Sat"
  hours: string; // e.g. "9:00 AM – 8:00 PM"
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  logoText: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: string;
  openingHours: OpeningHours[];
  social: { instagram: string; facebook: string; youtube: string; linkedin: string };
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  slotInterval: number; // minutes
  bookingWindowDays: number;
  taxRate: number;
  currency: "INR";
  invoicePrefix: string;
  /** Clinic UPI ID (VPA) used to generate payment QR codes, e.g. clinic@okhdfcbank. Empty = UPI QR disabled. */
  upiId: string;
  /** Name shown to the patient in their UPI app when scanning. */
  upiPayeeName: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  icon: string; // lucide icon key, see components/shared/icon.tsx
  title: string;
  description: string;
}

export interface WebsiteContent {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    image: string;
    primaryCta: string;
    secondaryCta: string;
    trustPoints: string[];
  };
  stats: Stat[];
  whyChooseUs: Feature[];
  about: {
    title: string;
    intro: string;
    story: string;
    mission: string;
    vision: string;
    image: string;
    values: Feature[];
    milestones: { year: string; title: string; description: string }[];
  };
  cta: { title: string; subtitle: string; button: string };
  contact: { title: string; subtitle: string };
}

/* ------------------------------------------------------------------ */
/* API envelope                                                        */
/* ------------------------------------------------------------------ */

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; details?: Record<string, string[] | undefined> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
