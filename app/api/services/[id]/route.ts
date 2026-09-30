import { catalogService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { fail, ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

/** Accepts an id (SRV-001) or a slug (dental-implants). */
export const GET = route<P>(async (_req, { params }) => {
  const service = (await catalogService.getServiceBySlug(params.id)) ?? (await catalogService.getService(params.id));
  if (!service.published && !(await getSession())) return fail(404, "NOT_FOUND", "Service not found");
  return ok(service);
});

export const PUT = route<P>(async (req, { params }) => ok(await catalogService.updateService(params.id, await readBody(req))), {
  admin: true,
});

export const DELETE = route<P>(async (_req, { params }) => ok(await catalogService.deleteService(params.id)), { admin: true });
