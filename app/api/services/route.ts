import { catalogService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { ok, readBody, route } from "@/lib/api/server";

/** Public: published services. Admin with ?all=1: every service. */
export const GET = route(async (req) => {
  const all = req.nextUrl.searchParams.get("all") === "1" && (await getSession());
  return ok(await catalogService.listServices({ publishedOnly: !all }));
});

export const POST = route(async (req) => ok(await catalogService.createService(await readBody(req)), 201), { admin: true });
