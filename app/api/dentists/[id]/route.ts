import { catalogService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { fail, ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  const dentist = await catalogService.getDentist(params.id);
  if (!dentist.active && !(await getSession())) return fail(404, "NOT_FOUND", "Dentist not found");
  return ok(dentist);
});

export const PUT = route<P>(async (req, { params }) => ok(await catalogService.updateDentist(params.id, await readBody(req))), {
  admin: true,
});

export const DELETE = route<P>(async (_req, { params }) => ok(await catalogService.deleteDentist(params.id)), { admin: true });
