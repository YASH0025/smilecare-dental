import { z } from "zod";
import { GALLERY_CATEGORIES, LEAD_STATUSES } from "@/types";
import { dateKey, emailSchema, idSchema, imageUrl, money, nonEmpty, optionalEmail, phoneSchema, timeKey } from "./common";

export const serviceSchema = z.object({
  name: nonEmpty("Name", 80),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  category: nonEmpty("Category", 40),
  description: nonEmpty("Short description", 240),
  content: z.string().trim().max(5000),
  duration: z.number({ message: "Duration is required" }).int().min(15, "Minimum 15 minutes").max(480),
  price: money,
  image: imageUrl,
  benefits: z.array(z.string().trim().min(1)).max(12),
  whoNeedsIt: z.array(z.string().trim().min(1)).max(12),
  procedure: z.array(z.object({ title: nonEmpty("Step title", 80), description: z.string().trim().max(400) })).max(12),
  recovery: z.string().trim().max(2000),
  faqs: z.array(z.object({ question: nonEmpty("Question", 200), answer: nonEmpty("Answer", 1000) })).max(12),
  published: z.boolean(),
  featured: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const workingDaySchema = z
  .object({
    day: z.number().int().min(0).max(6),
    enabled: z.boolean(),
    start: timeKey,
    end: timeKey,
    breakStart: z.union([timeKey, z.literal("")]).optional(),
    breakEnd: z.union([timeKey, z.literal("")]).optional(),
  })
  .refine((d) => !d.enabled || d.start < d.end, { message: "End must be after start", path: ["end"] });

export const leaveSchema = z
  .object({ id: z.string(), from: dateKey, to: dateKey, reason: z.string().trim().max(120) })
  .refine((l) => l.to >= l.from, { message: "End date must be after start", path: ["to"] });

export const dentistSchema = z.object({
  name: nonEmpty("Name", 80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  photo: imageUrl,
  qualification: nonEmpty("Qualification", 120),
  specialization: nonEmpty("Specialization", 120),
  experienceYears: z.number().int().min(0).max(60),
  bio: z.string().trim().max(2000),
  languages: z.array(z.string().trim().min(1)).max(8),
  serviceIds: z.array(z.string()),
  workingHours: z.array(workingDaySchema).length(7),
  leaves: z.array(leaveSchema),
  active: z.boolean(),
});
export type DentistInput = z.infer<typeof dentistSchema>;

export const portfolioSchema = z.object({
  title: nonEmpty("Title", 120),
  treatment: nonEmpty("Treatment", 80),
  category: nonEmpty("Category", 40),
  beforeImage: imageUrl.refine((v) => v !== "", "Before image is required"),
  afterImage: imageUrl.refine((v) => v !== "", "After image is required"),
  description: z.string().trim().max(1000),
  duration: z.string().trim().max(40),
  dentistId: idSchema,
  published: z.boolean(),
});
export type PortfolioInput = z.infer<typeof portfolioSchema>;

export const gallerySchema = z.object({
  title: nonEmpty("Title", 120),
  category: z.enum(GALLERY_CATEGORIES),
  image: imageUrl.refine((v) => v !== "", "Image is required"),
  description: z.string().trim().max(300),
  order: z.number().int().min(0).max(999),
  published: z.boolean(),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

export const testimonialSchema = z.object({
  patientName: nonEmpty("Patient name", 80),
  location: z.string().trim().max(80),
  rating: z.number().int().min(1).max(5),
  review: nonEmpty("Review", 1000),
  treatment: nonEmpty("Treatment", 80),
  date: dateKey,
  status: z.enum(["APPROVED", "PENDING", "HIDDEN"]),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  question: nonEmpty("Question", 200),
  answer: nonEmpty("Answer", 2000),
  category: nonEmpty("Category", 40),
  order: z.number().int().min(0).max(999),
  published: z.boolean(),
});
export type FaqInput = z.infer<typeof faqSchema>;

/** Public contact form. */
export const contactSchema = z.object({
  name: nonEmpty("Name", 80).min(2, "Enter your name"),
  phone: phoneSchema,
  email: emailSchema,
  interestedService: z.string().trim().max(80),
  message: nonEmpty("Message", 1000).min(10, "Tell us a little more (10+ characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const leadSchema = z.object({
  name: nonEmpty("Name", 80),
  phone: phoneSchema,
  email: optionalEmail,
  interestedService: z.string().trim().max(80),
  message: z.string().trim().max(1000),
  source: z.enum(["WEBSITE", "PHONE", "WALK_IN", "REFERRAL", "SOCIAL"]),
  status: z.enum(LEAD_STATUSES),
  notes: z.string().trim().max(1000),
});
export type LeadInput = z.infer<typeof leadSchema>;

export const settingsSchema = z.object({
  name: nonEmpty("Clinic name", 80),
  tagline: z.string().trim().max(120),
  logoText: nonEmpty("Logo text", 30),
  logoUrl: imageUrl,
  phone: nonEmpty("Phone", 20),
  whatsapp: z.string().trim().max(20),
  email: emailSchema,
  address: nonEmpty("Address", 200),
  city: nonEmpty("City", 80),
  emergencyContact: z.string().trim().max(40),
  openingHours: z.array(z.object({ label: nonEmpty("Label", 40), hours: nonEmpty("Hours", 60) })).min(1).max(7),
  social: z.object({
    instagram: z.string().trim().max(200),
    facebook: z.string().trim().max(200),
    youtube: z.string().trim().max(200),
    linkedin: z.string().trim().max(200),
  }),
  googleMapsUrl: z.string().trim().max(500),
  googleMapsEmbedUrl: z.string().trim().max(1000),
  slotInterval: z.number().refine((v) => [15, 20, 30, 60].includes(v), "Choose 15, 20, 30 or 60 minutes"),
  bookingWindowDays: z.number().int().min(7).max(180),
  taxRate: z.number().min(0).max(28),
  currency: z.literal("INR"),
  invoicePrefix: nonEmpty("Invoice prefix", 10),
  upiId: z
    .string()
    .trim()
    .max(80)
    .refine((v) => v === "" || /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(v), "Enter a valid UPI ID, e.g. clinicname@okhdfcbank"),
  upiPayeeName: z.string().trim().max(60),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

const featureSchema = z.object({ icon: z.string(), title: nonEmpty("Title", 60), description: z.string().trim().max(300) });

export const websiteContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().trim().max(80),
    title: nonEmpty("Hero title", 80),
    highlight: z.string().trim().max(80),
    subtitle: z.string().trim().max(300),
    image: imageUrl,
    primaryCta: nonEmpty("Primary CTA", 30),
    secondaryCta: nonEmpty("Secondary CTA", 30),
    trustPoints: z.array(z.string().trim().min(1)).max(4),
  }),
  stats: z.array(z.object({ value: nonEmpty("Value", 12), label: nonEmpty("Label", 40) })).max(4),
  whyChooseUs: z.array(featureSchema).max(9),
  about: z.object({
    title: nonEmpty("Title", 120),
    intro: z.string().trim().max(600),
    story: z.string().trim().max(3000),
    mission: z.string().trim().max(600),
    vision: z.string().trim().max(600),
    image: imageUrl,
    values: z.array(featureSchema).max(6),
    milestones: z.array(z.object({ year: z.string(), title: z.string(), description: z.string() })).max(8),
  }),
  cta: z.object({ title: nonEmpty("CTA title", 100), subtitle: z.string().trim().max(200), button: nonEmpty("Button", 30) }),
  contact: z.object({ title: nonEmpty("Title", 100), subtitle: z.string().trim().max(300) }),
});
export type WebsiteContentInput = z.infer<typeof websiteContentSchema>;
