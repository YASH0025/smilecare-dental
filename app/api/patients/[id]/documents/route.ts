import { patientService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

/** Records document metadata (file storage is out of scope for the JSON version). */
export const POST = route<{ id: string }>(
  async (req, { params }) => ok(await patientService.addDocument(params.id, await readBody(req)), 201),
  { admin: true },
);
