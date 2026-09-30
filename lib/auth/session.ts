import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { unauthorized } from "@/lib/services/errors";

/**
 * DEMO authentication.
 * A signed, httpOnly cookie holds the admin identity. Replace `verifyCredentials`
 * and the session helpers with NextAuth/Auth.js, Clerk or your IdP later —
 * callers only depend on `getSession()` / `requireAdmin()`.
 */

export const SESSION_COOKIE = "sc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface Session {
  email: string;
  name: string;
  role: "ADMIN";
  exp: number;
}

function secret() {
  return process.env.AUTH_SECRET || "smilecare-demo-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string, name: string) {
  const session: Session = { email, name, role: "ADMIN", exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function verifyCredentials(email: string, password: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@smilecare.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const emailOk = email.toLowerCase() === adminEmail;
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  const passwordOk = a.length === b.length && timingSafeEqual(a, b);
  return emailOk && passwordOk ? { email: adminEmail, name: "Dr. Clinic Admin" } : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}
