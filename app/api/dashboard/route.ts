import { analyticsService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const GET = route(async () => ok(await analyticsService.dashboard()), { admin: true });
