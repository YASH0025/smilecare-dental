import { appointmentService } from "@/lib/services";
import { ok, route, searchParams } from "@/lib/api/server";

/** GET /api/appointments/slots?dentistId=&date=&serviceId=&excludeId= — public availability. */
export const GET = route(async (req) => ok(await appointmentService.getSlots(searchParams(req))));
