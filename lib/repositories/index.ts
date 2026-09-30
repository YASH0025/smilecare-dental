import "server-only";
import type {
  AppNotification,
  Appointment,
  ClinicSettings,
  Dentist,
  Faq,
  GalleryItem,
  Invoice,
  Lead,
  Patient,
  Payment,
  PortfolioItem,
  Prescription,
  Service,
  Testimonial,
  Treatment,
  WebsiteContent,
} from "@/types";
import { createDocumentRepository, createJsonRepository, sequentialId } from "@/lib/json-db/repository";

/**
 * Concrete repositories. Every read/write of persisted data goes through here.
 * To migrate to PostgreSQL, re-implement these exports with Prisma (same method
 * signatures) — services, route handlers and UI stay unchanged.
 */
export const appointmentRepository = createJsonRepository<Appointment>("appointments", sequentialId("APT", 4));
export const patientRepository = createJsonRepository<Patient>("patients", sequentialId("P", 4));
export const serviceRepository = createJsonRepository<Service>("services", sequentialId("SRV", 3));
export const dentistRepository = createJsonRepository<Dentist>("dentists", sequentialId("DR", 3));
export const treatmentRepository = createJsonRepository<Treatment>("treatments", sequentialId("TRT", 4));
export const prescriptionRepository = createJsonRepository<Prescription>("prescriptions", sequentialId("RX", 4));
export const invoiceRepository = createJsonRepository<Invoice>("invoices", sequentialId("INV", 4));
export const paymentRepository = createJsonRepository<Payment>("payments", sequentialId("PAY", 4));
export const portfolioRepository = createJsonRepository<PortfolioItem>("portfolio", sequentialId("PF", 3));
export const galleryRepository = createJsonRepository<GalleryItem>("gallery", sequentialId("GAL", 3));
export const testimonialRepository = createJsonRepository<Testimonial>("testimonials", sequentialId("TST", 3));
export const faqRepository = createJsonRepository<Faq>("faqs", sequentialId("FAQ", 3));
export const leadRepository = createJsonRepository<Lead>("leads", sequentialId("LD", 4));
export const notificationRepository = createJsonRepository<AppNotification>("notifications", sequentialId("NTF", 5));

export const settingsRepository = createDocumentRepository<ClinicSettings>("settings");
export const websiteContentRepository = createDocumentRepository<WebsiteContent>("clinic");
