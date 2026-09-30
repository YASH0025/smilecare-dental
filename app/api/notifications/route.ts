import { notificationService } from "@/lib/services";
import { ok, route } from "@/lib/api/server";

export const GET = route(async () => ok(await notificationService.list()), { admin: true });

/** PUT /api/notifications — mark all as read. */
export const PUT = route(async () => ok(await notificationService.markAllRead()), { admin: true });
