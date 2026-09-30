import { patientService } from "@/lib/services";
import { requireAdmin } from "@/lib/auth/session";
import { ok, readBody, route } from "@/lib/api/server";

export const POST = route<{ id: string }>(async (req, { params }) => {
  const session = await requireAdmin();
  return ok(await patientService.addNote(params.id, await readBody(req), session.name), 201);
});
