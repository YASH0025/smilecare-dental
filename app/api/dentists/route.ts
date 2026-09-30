import { catalogService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { ok, readBody, route } from "@/lib/api/server";

/** Public: active dentists (?serviceId= filters to those offering a service). Admin ?all=1: everyone. */
export const GET = route(async (req) => {
  const all = req.nextUrl.searchParams.get("all") === "1" && (await getSession());
  const serviceId = req.nextUrl.searchParams.get("serviceId") ?? undefined;
  return ok(await catalogService.listDentists({ activeOnly: !all, serviceId }));
});

export const POST = route(async (req) => ok(await catalogService.createDentist(await readBody(req)), 201), { admin: true });
