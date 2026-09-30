/**
 * Service layer barrel. Route handlers and Server Components import from here;
 * nothing in this folder may be imported by a Client Component.
 */
export { appointmentService, allowedTransitions } from "./appointment.service";
export { patientService } from "./patient.service";
export { catalogService } from "./catalog.service";
export { treatmentService, prescriptionService } from "./clinical.service";
export { billingService } from "./billing.service";
export { portfolioService, galleryService, testimonialService, faqService, leadService } from "./cms.service";
export { settingsService, websiteContentService } from "./settings.service";
export { notificationService } from "./notification.service";
export { analyticsService } from "./analytics.service";
