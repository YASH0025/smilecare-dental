import { billingService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const POST = route<{ id: string }>(async (_req, { params }) => ok(await billingService.cancel(params.id)), { admin: true });
