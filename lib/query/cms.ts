"use client";

import { useQuery } from "@tanstack/react-query";
import type { Dentist, Faq, GalleryItem, Lead, PortfolioItem, Service, Testimonial } from "@/types";
import { api } from "@/lib/api/client";
import { affects, qk, type CmsResource } from "./keys";
import { useApiMutation } from "./mutation";

type EntityOf<R extends CmsResource> = {
  services: Service;
  dentists: Dentist;
  portfolio: PortfolioItem;
  gallery: GalleryItem;
  testimonials: Testimonial;
  faqs: Faq;
  leads: Lead;
}[R];

/** Full admin list of a CMS collection (`?all=1` includes unpublished items). */
export function useCollection<R extends CmsResource>(resource: R) {
  return useQuery({
    queryKey: qk.collection(resource),
    queryFn: () => api.get<EntityOf<R>[]>(`/api/${resource}?all=1`),
  });
}

/** save (create/update), patch (quick toggles) and remove for a CMS collection. */
export function useCollectionMutations<R extends CmsResource>(resource: R, label: string) {
  const endpoint = `/api/${resource}`;
  const invalidate = affects[resource];

  const save = useApiMutation({
    mutationFn: ({ id, data }: { id?: string; data: unknown }) =>
      id ? api.put<EntityOf<R>>(`${endpoint}/${id}`, data) : api.post<EntityOf<R>>(endpoint, data),
    invalidate,
    success: (_d, v) => `${label} ${v.id ? "updated" : "created"} successfully.`,
  });

  const patch = useApiMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EntityOf<R>>; message: string }) => api.put<EntityOf<R>>(`${endpoint}/${id}`, data),
    invalidate,
    success: (_d, v) => v.message,
  });

  const remove = useApiMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    invalidate,
    success: `${label} deleted.`,
  });

  return { save, patch, remove };
}
