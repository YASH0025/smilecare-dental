import { settingsService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

export const GET = route(async () => ok(await settingsService.get()));
export const PUT = route(async (req) => ok(await settingsService.update(await readBody(req))), { admin: true });
