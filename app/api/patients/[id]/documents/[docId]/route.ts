import { patientService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const DELETE = route<{ id: string; docId: string }>(
  async (_req, { params }) => ok(await patientService.deleteDocument(params.id, params.docId)),
  { admin: true },
);
