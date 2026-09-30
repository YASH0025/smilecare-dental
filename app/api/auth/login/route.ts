import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyCredentials } from "@/lib/auth/session";
import { fail, parseBody, route } from "@/lib/api/server";

export const POST = route(async (req) => {
  const { email, password } = await parseBody(req, loginSchema);
  // Small constant delay to blunt brute-force timing probes in the demo.
  await new Promise((r) => setTimeout(r, 250));
  const user = verifyCredentials(email, password);
  if (!user) return fail(401, "INVALID_CREDENTIALS", "Incorrect email or password");

  const res = NextResponse.json({ ok: true, data: { email: user.email, name: user.name } });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.email, user.name), sessionCookieOptions);
  return res;
});
