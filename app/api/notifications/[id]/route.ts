import { notificationService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const PUT = route<{ id: string }>(async (_req, { params }) => ok(await notificationService.markRead(params.id)), { admin: true });
