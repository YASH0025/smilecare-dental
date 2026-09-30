import { patientService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

/** Returns the full patient profile (appointments, treatments, prescriptions, billing). */
export const GET = route<P>(async (_req, { params }) => ok(await patientService.profile(params.id)), { admin: true });

export const PUT = route<P>(async (req, { params }) => ok(await patientService.update(params.id, await readBody(req))), {
  admin: true,
});

export const DELETE = route<P>(async (_req, { params }) => ok(await patientService.delete(params.id)), { admin: true });
