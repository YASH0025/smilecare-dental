"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AppNotification, ClinicSettings, WebsiteContent } from "@/types";
import type { DashboardData, ReportsData } from "@/types/views";
import type { ContactInput, SettingsInput, WebsiteContentInput } from "@/lib/validations/cms";
import type { LoginInput } from "@/lib/validations/auth";
import { api } from "@/lib/api/client";
import { affects, qk } from "./keys";
import { useApiMutation } from "./mutation";

export function useDashboard() {
  return useQuery({ queryKey: qk.dashboard(), queryFn: () => api.get<DashboardData>("/api/dashboard") });
}

/** Keeps the previous report on screen while a new date range loads. */
export function useReports(range: { from?: string; to?: string }) {
  return useQuery({
    queryKey: qk.reports(range),
    queryFn: () => {
      const qs = new URLSearchParams(Object.entries(range).filter(([, v]) => v) as [string, string][]);
      return api.get<ReportsData>(`/api/reports${qs.size ? `?${qs}` : ""}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useSettings() {
  return useQuery({ queryKey: qk.settings(), queryFn: () => api.get<ClinicSettings>("/api/settings") });
}

export function useSaveSettings() {
  return useApiMutation({
    mutationFn: (data: SettingsInput) => api.put<ClinicSettings>("/api/settings", data),
    invalidate: affects.settings,
    success: "Clinic settings saved.",
  });
}

export function useWebsiteContent() {
  return useQuery({ queryKey: qk.content(), queryFn: () => api.get<WebsiteContent>("/api/content") });
}

export function useSaveWebsiteContent() {
  return useApiMutation({
    mutationFn: (data: WebsiteContentInput) => api.put<WebsiteContent>("/api/content", data),
    invalidate: affects.content,
    success: "Website content updated.",
  });
}

/** Polls every 30s so new website bookings show up in the bell. */
export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications(),
    queryFn: () => api.get<AppNotification[]>("/api/notifications"),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  return useApiMutation({ mutationFn: (id: string) => api.put(`/api/notifications/${id}`), invalidate: affects.notifications });
}

export function useMarkAllNotificationsRead() {
  return useApiMutation({ mutationFn: () => api.put("/api/notifications"), invalidate: affects.notifications });
}

export function useSubmitContact() {
  return useApiMutation({
    mutationFn: (values: ContactInput) => api.post<{ id: string }>("/api/leads", values),
    success: "Message sent. We'll get back to you within one working day.",
  });
}

export function useLogin() {
  return useApiMutation({
    mutationFn: (values: LoginInput) => api.post<{ email: string; name: string }>("/api/auth/login", values),
    success: "Signed in successfully.",
    toastError: false,
  });
}

export function useLogout() {
  return useApiMutation({ mutationFn: () => api.post("/api/auth/logout") });
}
