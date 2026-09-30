import { leadService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => ok(await leadService.get(params.id)), { admin: true });
export const PUT = route<P>(async (req, { params }) => ok(await leadService.update(params.id, await readBody(req))), {
  admin: true,
});
export const DELETE = route<P>(async (_req, { params }) => ok(await leadService.delete(params.id)), { admin: true });
