import { billingService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const GET = route(async () => ok(await billingService.listPayments()), { admin: true });
