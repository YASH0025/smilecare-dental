import type { QueryKey } from "@tanstack/react-query";

/**
 * Central query-key factory. Keys are hierarchical so a whole family can be
 * invalidated by prefix, e.g. `invalidateQueries({ queryKey: ["appointments"] })`.
 */
export const qk = {
  appointments: (filters: Record<string, string | undefined> = {}) => ["appointments", filters] as const,
  slots: (p: { dentistId?: string; date?: string; serviceId?: string; excludeId?: string }) => ["slots", p] as const,
  patients: () => ["patients"] as const,
  patient: (id: string) => ["patient", id] as const,
  treatments: () => ["treatments"] as const,
  prescriptions: () => ["prescriptions"] as const,
  invoices: () => ["invoices"] as const,
  payments: () => ["payments"] as const,
  services: () => ["services", "all"] as const,
  dentists: () => ["dentists", "all"] as const,
  collection: (resource: CmsResource) => [resource, "all"] as const,
  settings: () => ["settings"] as const,
  content: () => ["content"] as const,
  notifications: () => ["notifications"] as const,
  dashboard: () => ["dashboard"] as const,
  reports: (range: { from?: string; to?: string }) => ["reports", range] as const,
};

export type CmsResource = "services" | "dentists" | "portfolio" | "gallery" | "testimonials" | "faqs" | "leads";

/** Which cached data a write can make stale. Mutations invalidate these prefixes. */
export const affects: Record<string, QueryKey[]> = {
  appointments: [["appointments"], ["slots"], ["patients"], ["patient"], ["dashboard"], ["reports"], ["notifications"]],
  patients: [["patients"], ["patient"], ["appointments"], ["dashboard"], ["notifications"]],
  treatments: [["treatments"], ["patient"], ["patients"]],
  prescriptions: [["prescriptions"], ["patient"]],
  billing: [["invoices"], ["payments"], ["patients"], ["patient"], ["dashboard"], ["reports"], ["notifications"]],
  services: [["services"], ["dentists"]],
  dentists: [["dentists"], ["slots"]],
  portfolio: [["portfolio"]],
  gallery: [["gallery"]],
  testimonials: [["testimonials"]],
  faqs: [["faqs"]],
  leads: [["leads"], ["notifications"], ["reports"]],
  settings: [["settings"], ["slots"]],
  content: [["content"]],
  notifications: [["notifications"]],
};
