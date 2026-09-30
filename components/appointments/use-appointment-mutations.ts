"use client";

import * as React from "react";
import type { AppointmentStatus } from "@/types";
import type { AppointmentView } from "@/types/views";
import { useUpdateAppointment } from "@/lib/query";

/**
 * Status-change / reschedule helper shared by the calendar, table and patient profile.
 * Backed by TanStack Query: optimistic status update + cache invalidation.
 */
export function useAppointmentMutations(onUpdated?: (a: AppointmentView) => void) {
  const mutation = useUpdateAppointment();
  const vars = mutation.isPending ? mutation.variables : undefined;
  const pending = vars ? `${vars.id}:${vars.kind === "status" ? vars.status : "RESCHEDULED"}` : null;

  const changeStatus = React.useCallback(
    async (id: string, status: AppointmentStatus, note?: string) => {
      const updated = await mutation.mutateAsync({ id, kind: "status", status, note });
      onUpdated?.(updated);
      return updated;
    },
    [mutation, onUpdated],
  );

  const reschedule = React.useCallback(
    async (id: string, date: string, time: string, note?: string) => {
      const updated = await mutation.mutateAsync({ id, kind: "reschedule", date, time, note });
      onUpdated?.(updated);
      return updated;
    },
    [mutation, onUpdated],
  );

  return { changeStatus, reschedule, pending };
}
