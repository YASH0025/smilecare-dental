import { billingService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => ok(await billingService.get(params.id)), { admin: true });
export const PUT = route<P>(async (req, { params }) => ok(await billingService.update(params.id, await readBody(req))), {
  admin: true,
});
export const DELETE = route<P>(async (_req, { params }) => ok(await billingService.delete(params.id)), { admin: true });
