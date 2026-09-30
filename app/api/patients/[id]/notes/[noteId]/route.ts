import { patientService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const DELETE = route<{ id: string; noteId: string }>(
  async (_req, { params }) => ok(await patientService.deleteNote(params.id, params.noteId)),
  { admin: true },
);
