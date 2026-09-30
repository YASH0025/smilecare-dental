"use client";

import { useQuery } from "@tanstack/react-query";
import type { Prescription, Treatment, TreatmentStep } from "@/types";
import type { PrescriptionView, TreatmentView } from "@/types/views";
import type { PrescriptionInput, TreatmentInput } from "@/lib/validations/clinical";
import { api } from "@/lib/api/client";
import { affects, qk } from "./keys";
import { useApiMutation } from "./mutation";

export function useTreatments() {
  return useQuery({ queryKey: qk.treatments(), queryFn: () => api.get<TreatmentView[]>("/api/treatments") });
}

export function useSaveTreatment() {
  return useApiMutation({
    mutationFn: ({ id, data }: { id?: string; data: TreatmentInput }) =>
      id ? api.put<Treatment>(`/api/treatments/${id}`, data) : api.post<Treatment>("/api/treatments", data),
    invalidate: affects.treatments,
    success: (_t, v) => (v.id ? "Treatment plan updated successfully." : "Treatment plan created successfully."),
  });
}

/** Tick / untick a checklist step (server recalculates the plan status). */
export function useToggleTreatmentStep() {
  return useApiMutation({
    mutationFn: ({ id, steps }: { id: string; steps: TreatmentStep[]; done: boolean; stepId: string }) => api.put<Treatment>(`/api/treatments/${id}`, { steps }),
    invalidate: affects.treatments,
    success: (_t, v) => (v.done ? "Step marked as done." : "Step reopened."),
  });
}

export function useDeleteTreatment() {
  return useApiMutation({
    mutationFn: (id: string) => api.delete(`/api/treatments/${id}`),
    invalidate: affects.treatments,
    success: "Treatment plan deleted.",
  });
}

export function usePrescriptions() {
  return useQuery({ queryKey: qk.prescriptions(), queryFn: () => api.get<PrescriptionView[]>("/api/prescriptions") });
}

export function useSavePrescription() {
  return useApiMutation({
    mutationFn: ({ id, data }: { id?: string; data: PrescriptionInput }) =>
      id ? api.put<Prescription>(`/api/prescriptions/${id}`, data) : api.post<Prescription>("/api/prescriptions", data),
    invalidate: affects.prescriptions,
    success: (_p, v) => (v.id ? "Prescription updated successfully." : "Prescription created successfully."),
  });
}

export function useDeletePrescription() {
  return useApiMutation({
    mutationFn: (id: string) => api.delete(`/api/prescriptions/${id}`),
    invalidate: affects.prescriptions,
    success: "Prescription deleted.",
  });
}
