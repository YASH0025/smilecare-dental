import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { JsonStoreError } from "@/lib/json-db/store";
import { ServiceError, badRequest } from "@/lib/services/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { ApiFailure, ApiSuccess } from "@/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function fail(status: number, code: string, message: string, details?: ApiFailure["error"]["details"]) {
  return NextResponse.json<ApiFailure>({ ok: false, error: { code, message, details } }, { status });
}

function toResponse(error: unknown) {
  if (error instanceof ZodError) {
    const flat = error.flatten();
    const fieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
    const first = flat.formErrors[0] ?? Object.values(fieldErrors).flat()[0] ?? "Invalid request";
    return fail(422, "VALIDATION_ERROR", first ?? "Invalid request", fieldErrors);
  }
  if (error instanceof ServiceError) {
    return fail(error.status, error.code, error.message, error.details);
  }
  if (error instanceof JsonStoreError) {
    // Never leak file-system paths or stack traces to clients.
    console.error(`[data] ${error.message}`, error.cause);
    return fail(500, "STORAGE_ERROR", "We couldn't access clinic data. Please try again.");
  }
  console.error("[api] Unhandled error", error);
  return fail(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (req: NextRequest, ctx: { params: P }) => Promise<Response>;

interface RouteOptions {
  /** Require an authenticated admin session. */
  admin?: boolean;
}

/** Wraps a route handler with auth + uniform error mapping. */
export function route<P = Record<string, string>>(handler: Handler<P>, options: RouteOptions = {}) {
  return async (req: NextRequest, ctx: Ctx<P>) => {
    try {
      if (options.admin) await requireAdmin();
      const params = ctx?.params ? await ctx.params : ({} as P);
      return await handler(req, { params });
    } catch (error) {
      return toResponse(error);
    }
  };
}

export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw badRequest("Request body must be valid JSON", "INVALID_JSON");
  }
  return schema.parse(json);
}

/** Reads a JSON body; malformed JSON is a 400 rather than a silent `{}`. */
export async function readBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw badRequest("Request body must be valid JSON", "INVALID_JSON");
  }
}

export function searchParams(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}
