import "server-only";
import type { AppNotification, NotificationType } from "@/types";
import { notificationRepository } from "@/lib/repositories";

/**
 * Notification service — simulated.
 * Records notifications in notifications.json and logs the channels that
 * WOULD be used. Plug real providers (email/SMS/WhatsApp) into `deliver()` later.
 */
const CHANNELS: Record<NotificationType, AppNotification["channels"]> = {
  APPOINTMENT_REQUESTED: ["IN_APP", "EMAIL"],
  APPOINTMENT_CONFIRMED: ["IN_APP", "EMAIL", "SMS"],
  APPOINTMENT_CANCELLED: ["IN_APP", "EMAIL", "SMS"],
  APPOINTMENT_REMINDER: ["SMS", "WHATSAPP"],
  NEW_PATIENT: ["IN_APP"],
  PAYMENT_RECEIVED: ["IN_APP", "EMAIL"],
  NEW_LEAD: ["IN_APP"],
};

async function deliver(notification: AppNotification) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[notify:simulated] ${notification.type} via ${notification.channels.join(", ")} — ${notification.title}`);
  }
}

export const notificationService = {
  async notify(type: NotificationType, title: string, message: string, link?: string) {
    try {
      const created = await notificationRepository.create({
        type,
        title,
        message,
        link,
        read: false,
        channels: CHANNELS[type],
      });
      await deliver(created);
      return created;
    } catch (error) {
      // Notifications must never break the primary action.
      console.error("[notify] failed", error);
      return null;
    }
  },

  async list(limit = 30) {
    const all = await notificationRepository.getAll();
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  async markRead(id: string) {
    return notificationRepository.update(id, { read: true });
  },

  async markAllRead() {
    return notificationRepository.transaction((items) => ({
      items: items.map((n) => ({ ...n, read: true })),
      result: true,
    }));
  },
};
