import { appointmentService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => ok(await appointmentService.get(params.id)), { admin: true });

/** PUT supports status changes, notes and rescheduling (date/time/dentist/service). */
export const PUT = route<P>(async (req, { params }) => ok(await appointmentService.update(params.id, await readBody(req))), {
  admin: true,
});

export const DELETE = route<P>(async (_req, { params }) => ok(await appointmentService.delete(params.id)), { admin: true });
