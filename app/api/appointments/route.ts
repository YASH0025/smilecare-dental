import { appointmentService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { ok, readBody, route, searchParams } from "@/lib/api/server";
import { unauthorized } from "@/lib/services/errors";

/** GET /api/appointments — admin list with filters (?from&to&dentistId&serviceId&status&patientId&q). */
export const GET = route(async (req) => ok(await appointmentService.list(searchParams(req))), { admin: true });

/**
 * POST /api/appointments
 * - Public website booking (payload has `fullName`) → PENDING appointment.
 * - Admin creation (payload has `patientName`) → requires a session.
 */
export const POST = route(async (req) => {
  const body = await readBody(req);
  if (body && typeof body === "object" && "fullName" in body) {
    return ok(await appointmentService.book(body), 201);
  }
  if (!(await getSession())) throw unauthorized();
  return ok(await appointmentService.create(body), 201);
});
