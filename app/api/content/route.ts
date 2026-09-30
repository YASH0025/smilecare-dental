import { websiteContentService } from "@/lib/services";
import { ok, readBody, route } from "@/lib/api/server";

/** Website CMS content (hero, stats, about, CTA…). */
export const GET = route(async () => ok(await websiteContentService.get()));
export const PUT = route(async (req) => ok(await websiteContentService.update(await readBody(req))), { admin: true });
