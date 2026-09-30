import "server-only";
import type { ZodType } from "zod";
import type { BaseEntity } from "@/types";
import type { CreateInput, Repository } from "@/lib/json-db/repository";
import {
  faqRepository,
  galleryRepository,
  leadRepository,
  portfolioRepository,
  testimonialRepository,
  dentistRepository,
} from "@/lib/repositories";
import { contactSchema, faqSchema, gallerySchema, leadSchema, portfolioSchema, testimonialSchema } from "@/lib/validations";
import { notFound } from "./errors";
import { notificationService } from "./notification.service";

/**
 * Generic CRUD service for simple CMS collections. Entity-specific rules
 * (e.g. referential checks) are supplied through `beforeWrite`.
 */
function createCrudService<T extends BaseEntity, I extends object>(opts: {
  label: string;
  repo: Repository<T>;
  schema: ZodType<I>;
  sort?: (a: T, b: T) => number;
  beforeWrite?: (data: Partial<I>) => Promise<void>;
}) {
  const { label, repo, schema, sort, beforeWrite } = opts;
  return {
    async list(filter?: (item: T) => boolean) {
      const all = await repo.getAll();
      const filtered = filter ? all.filter(filter) : all;
      return sort ? filtered.sort(sort) : filtered;
    },
    async get(id: string) {
      const item = await repo.getById(id);
      if (!item) throw notFound(label);
      return item;
    },
    async create(input: unknown) {
      const data = schema.parse(input);
      await beforeWrite?.(data);
      return repo.create(data as unknown as CreateInput<T>);
    },
    async update(id: string, input: unknown) {
      const data = (schema as unknown as { partial: () => ZodType<Partial<I>> }).partial().parse(input);
      await beforeWrite?.(data);
      const updated = await repo.update(id, data as Partial<T>);
      if (!updated) throw notFound(label);
      return updated;
    },
    async delete(id: string) {
      if (!(await repo.delete(id))) throw notFound(label);
      return { id };
    },
  };
}

export const portfolioService = createCrudService({
  label: "Portfolio entry",
  repo: portfolioRepository,
  schema: portfolioSchema,
  sort: (a, b) => b.createdAt.localeCompare(a.createdAt),
  beforeWrite: async (data) => {
    if (data.dentistId && !(await dentistRepository.getById(data.dentistId))) throw notFound("Dentist");
  },
});

export const galleryService = createCrudService({
  label: "Gallery image",
  repo: galleryRepository,
  schema: gallerySchema,
  sort: (a, b) => a.order - b.order,
});

export const testimonialService = createCrudService({
  label: "Testimonial",
  repo: testimonialRepository,
  schema: testimonialSchema,
  sort: (a, b) => b.date.localeCompare(a.date),
});

export const faqService = createCrudService({
  label: "FAQ",
  repo: faqRepository,
  schema: faqSchema,
  sort: (a, b) => a.category.localeCompare(b.category) || a.order - b.order,
});

const leadCrud = createCrudService({
  label: "Lead",
  repo: leadRepository,
  schema: leadSchema,
  sort: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export const leadService = {
  ...leadCrud,
  /** Public contact form submission → new website lead. */
  async submitContact(input: unknown) {
    const data = contactSchema.parse(input);
    const lead = await leadRepository.create({
      ...data,
      source: "WEBSITE",
      status: "NEW",
      notes: "",
    });
    await notificationService.notify(
      "NEW_LEAD",
      "New website enquiry",
      `${lead.name}${lead.interestedService ? ` · ${lead.interestedService}` : ""}`,
      `/admin/leads`,
    );
    return { id: lead.id };
  },
};
