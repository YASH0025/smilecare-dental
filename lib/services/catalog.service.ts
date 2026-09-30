import "server-only";
import type { Dentist, Service } from "@/types";
import { appointmentRepository, dentistRepository, serviceRepository } from "@/lib/repositories";
import { dentistSchema, serviceSchema } from "@/lib/validations";
import { conflict, notFound } from "./errors";
import { toDateKey } from "@/lib/utils/format";

const bySortName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

export const catalogService = {
  /* ---------------- Services ---------------- */
  async listServices(opts: { publishedOnly?: boolean } = {}) {
    const all = await serviceRepository.getAll();
    return opts.publishedOnly ? all.filter((s) => s.published) : all;
  },

  async getService(id: string) {
    const s = await serviceRepository.getById(id);
    if (!s) throw notFound("Service");
    return s;
  },

  async getServiceBySlug(slug: string, opts: { publishedOnly?: boolean } = {}) {
    const s = await serviceRepository.findOne((x) => x.slug === slug);
    if (!s || (opts.publishedOnly && !s.published)) return null;
    return s;
  },

  async createService(input: unknown): Promise<Service> {
    const data = serviceSchema.parse(input);
    if (await serviceRepository.findOne((s) => s.slug === data.slug)) {
      throw conflict(`A service with the slug "${data.slug}" already exists`, "DUPLICATE_SLUG");
    }
    return serviceRepository.create(data);
  },

  async updateService(id: string, input: unknown) {
    const data = serviceSchema.partial().parse(input);
    if (data.slug && (await serviceRepository.findOne((s) => s.slug === data.slug && s.id !== id))) {
      throw conflict(`A service with the slug "${data.slug}" already exists`, "DUPLICATE_SLUG");
    }
    const updated = await serviceRepository.update(id, data);
    if (!updated) throw notFound("Service");
    return updated;
  },

  async deleteService(id: string) {
    const today = toDateKey(new Date());
    const upcoming = await appointmentRepository.findOne(
      (a) => a.serviceId === id && a.date >= today && ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(a.status),
    );
    if (upcoming) {
      throw conflict("This service has upcoming appointments. Unpublish it instead, or reassign those appointments first.");
    }
    if (!(await serviceRepository.delete(id))) throw notFound("Service");
    // Detach from dentists
    await dentistRepository.transaction((items) => ({
      items: items.map((d) => ({ ...d, serviceIds: d.serviceIds.filter((s) => s !== id) })),
      result: true,
    }));
    return { id };
  },

  /* ---------------- Dentists ---------------- */
  async listDentists(opts: { activeOnly?: boolean; serviceId?: string } = {}) {
    let all = await dentistRepository.getAll();
    if (opts.activeOnly) all = all.filter((d) => d.active);
    if (opts.serviceId) all = all.filter((d) => d.serviceIds.includes(opts.serviceId!));
    return all.sort(bySortName);
  },

  async getDentist(id: string) {
    const d = await dentistRepository.getById(id);
    if (!d) throw notFound("Dentist");
    return d;
  },

  async getDentistBySlug(slug: string) {
    return dentistRepository.findOne((d) => d.slug === slug && d.active);
  },

  async createDentist(input: unknown): Promise<Dentist> {
    const data = dentistSchema.parse(input);
    if (await dentistRepository.findOne((d) => d.slug === data.slug)) {
      throw conflict(`A dentist with the slug "${data.slug}" already exists`, "DUPLICATE_SLUG");
    }
    return dentistRepository.create(data);
  },

  async updateDentist(id: string, input: unknown) {
    const data = dentistSchema.partial().parse(input);
    if (data.slug && (await dentistRepository.findOne((d) => d.slug === data.slug && d.id !== id))) {
      throw conflict(`A dentist with the slug "${data.slug}" already exists`, "DUPLICATE_SLUG");
    }
    const updated = await dentistRepository.update(id, data);
    if (!updated) throw notFound("Dentist");
    return updated;
  },

  async deleteDentist(id: string) {
    const today = toDateKey(new Date());
    const upcoming = await appointmentRepository.findOne(
      (a) => a.dentistId === id && a.date >= today && ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(a.status),
    );
    if (upcoming) {
      throw conflict("This dentist has upcoming appointments. Mark them inactive instead, or reassign appointments first.");
    }
    if (!(await dentistRepository.delete(id))) throw notFound("Dentist");
    return { id };
  },
};
