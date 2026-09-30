"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppointmentStatus } from "@/types";
import type { AppointmentView } from "@/types/views";
import type { AppointmentCreateInput, BookingInput } from "@/lib/validations/appointment";
import type { SlotsResponse } from "@/components/booking/types";
import { api } from "@/lib/api/client";
import { affects, qk } from "./keys";
import { useApiMutation } from "./mutation";

const STATUS_MESSAGES: Record<AppointmentStatus, string> = {
  PENDING: "Appointment reopened as pending.",
  CONFIRMED: "Appointment confirmed successfully.",
  COMPLETED: "Appointment marked as completed.",
  CANCELLED: "Appointment cancelled.",
  NO_SHOW: "Appointment marked as no-show.",
  RESCHEDULED: "Appointment rescheduled successfully.",
};

export function useAppointments(filters: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: qk.appointments(filters),
    queryFn: () => {
      const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
      return api.get<AppointmentView[]>(`/api/appointments${qs.size ? `?${qs}` : ""}`);
    },
  });
}

/** Availability for one dentist/date. Disabled until both are chosen. */
export function useSlotsQuery(params: { dentistId?: string; date?: string; serviceId?: string; excludeId?: string }) {
  return useQuery({
    queryKey: qk.slots(params),
    enabled: Boolean(params.dentistId && params.date),
    staleTime: 0, // availability must always be fresh
    queryFn: ({ signal }) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => v && qs.set(k, v));
      return fetch(`/api/appointments/slots?${qs}`, { signal, cache: "no-store" }).then(async (res) => {
        const json = await res.json();
        if (!json.ok) throw new Error(json.error?.message ?? "Unable to load slots");
        return json.data as SlotsResponse;
      });
    },
  });
}

/** Public website booking. */
export function useBookAppointment() {
  return useApiMutation({
    mutationFn: (values: BookingInput) => api.post<AppointmentView>("/api/appointments", values),
    invalidate: affects.appointments,
    success: "Appointment requested successfully.",
  });
}

/** Admin-created appointment. */
export function useCreateAppointment() {
  return useApiMutation({
    mutationFn: (values: AppointmentCreateInput) => api.post<AppointmentView>("/api/appointments", values),
    invalidate: affects.appointments,
    success: (a) => `Appointment ${a.id} created successfully.`,
  });
}

type UpdateVars =
  | { id: string; kind: "status"; status: AppointmentStatus; note?: string }
  | { id: string; kind: "reschedule"; date: string; time: string; note?: string };

/**
 * Status changes and rescheduling. Status changes are applied optimistically to every
 * cached appointment list so the calendar colour flips instantly, then reconciled.
 */
export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useApiMutation<UpdateVars, AppointmentView, { snapshots: [readonly unknown[], AppointmentView[] | undefined][] }>({
    mutationFn: (v) =>
      api.put<AppointmentView>(`/api/appointments/${v.id}`, v.kind === "status" ? { status: v.status, note: v.note } : { date: v.date, time: v.time, note: v.note }),
    onMutate: async (v) => {
      if (v.kind !== "status") return { snapshots: [] };
      await qc.cancelQueries({ queryKey: ["appointments"] });
      const snapshots = qc.getQueriesData<AppointmentView[]>({ queryKey: ["appointments"] });
      qc.setQueriesData<AppointmentView[]>({ queryKey: ["appointments"] }, (list) => list?.map((a) => (a.id === v.id ? { ...a, status: v.status } : a)));
      return { snapshots };
    },
    onError: (_e, _v, ctx) => ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data)),
    invalidate: affects.appointments,
    success: (_a, v) => (v.kind === "status" ? STATUS_MESSAGES[v.status] : STATUS_MESSAGES.RESCHEDULED),
  });
}

export function useDeleteAppointment() {
  return useApiMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/appointments/${id}`),
    invalidate: affects.appointments,
    success: "Appointment deleted.",
  });
}
