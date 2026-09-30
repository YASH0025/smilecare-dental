import { analyticsService } from "@/lib/services";
import { ok, route, searchParams } from "@/lib/api/server";

/** GET /api/reports?from=yyyy-MM-dd&to=yyyy-MM-dd */
export const GET = route(async (req) => {
  const { from, to } = searchParams(req);
  const valid = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  return ok(await analyticsService.reports({ from: valid(from), to: valid(to) }));
}, { admin: true });
