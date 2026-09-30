import { leadService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { ok, readBody, route } from "@/lib/api/server";

export const GET = route(async () => ok(await leadService.list()), { admin: true });

/**
 * POST /api/leads
 * - Public contact form → creates a NEW website lead.
 * - Admin session with a full lead payload (has `status`) → manual lead entry.
 */
export const POST = route(async (req) => {
  const body = await readBody(req);
  if (body && typeof body === "object" && "status" in body && (await getSession())) {
    return ok(await leadService.create(body), 201);
  }
  return ok(await leadService.submitContact(body), 201);
});
