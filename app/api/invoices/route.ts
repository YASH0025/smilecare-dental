import { billingService } from "@/lib/services";
import { ok, readBody, route, searchParams } from "@/lib/api/server";

export const GET = route(async (req) => ok(await billingService.list(searchParams(req))), { admin: true });
export const POST = route(async (req) => ok(await billingService.create(await readBody(req)), 201), { admin: true });
