import "server-only";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fail, ok, readBody, route } from "./server";

interface CrudService<T> {
  list(filter?: (item: T) => boolean): Promise<T[]>;
  get(id: string): Promise<T>;
  create(input: unknown): Promise<T>;
  update(id: string, input: unknown): Promise<T>;
  delete(id: string): Promise<{ id: string }>;
}

/**
 * Builds standard REST handlers for a CMS collection:
 *   GET    /api/x        (public sees only `isPublic` items; admins see all)
 *   POST   /api/x        (admin)
 *   GET    /api/x/:id    (public if `isPublic`, else admin)
 *   PUT    /api/x/:id    (admin)
 *   DELETE /api/x/:id    (admin)
 */
export function crudRoutes<T>(service: CrudService<T>, isPublic: (item: T) => boolean) {
  const collection = {
    GET: route(async (req: NextRequest) => {
      const session = await getSession();
      const wantsAll = req.nextUrl.searchParams.get("all") === "1";
      const items = await service.list(session && wantsAll ? undefined : isPublic);
      return ok(items);
    }),
    POST: route(async (req) => ok(await service.create(await readBody(req)), 201), { admin: true }),
  };

  const item = {
    GET: route<{ id: string }>(async (_req, { params }) => {
      const record = await service.get(params.id);
      if (!isPublic(record) && !(await getSession())) {
        return fail(404, "NOT_FOUND", "Not found");
      }
      return ok(record);
    }),
    PUT: route<{ id: string }>(async (req, { params }) => ok(await service.update(params.id, await readBody(req))), {
      admin: true,
    }),
    DELETE: route<{ id: string }>(async (_req, { params }) => ok(await service.delete(params.id)), { admin: true }),
  };

  return { collection, item };
}
