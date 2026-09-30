import { patientService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

/** PUT /api/patients/:id/teeth — { teeth: ["16","17"], condition: "DECAY", notes? } */
export const PUT = route<{ id: string }>(
  async (req, { params }) => ok(await patientService.updateTeeth(params.id, await readBody(req))),
  { admin: true },
);
