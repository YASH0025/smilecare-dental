import { getSession } from "@/lib/auth/session";
import { ok, route } from "@/lib/api/server";

export const GET = route(async () => {
  const session = await getSession();
  return ok(session ? { email: session.email, name: session.name, role: session.role } : null);
});
