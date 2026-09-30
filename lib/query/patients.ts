"use client";

import { useQuery } from "@tanstack/react-query";
import type { Patient, PatientDocument, PatientNote } from "@/types";
import type { PatientListItem, PatientProfile } from "@/types/views";
import type { PatientDocumentInput, PatientInput, ToothUpdateInput } from "@/lib/validations/patient";
import { api } from "@/lib/api/client";
import { affects, qk } from "./keys";
import { useApiMutation } from "./mutation";

export function usePatients() {
  return useQuery({ queryKey: qk.patients(), queryFn: () => api.get<PatientListItem[]>("/api/patients") });
}

export function usePatientProfile(id: string) {
  return useQuery({ queryKey: qk.patient(id), queryFn: () => api.get<PatientProfile>(`/api/patients/${id}`) });
}

export function useSavePatient() {
  return useApiMutation({
    mutationFn: ({ id, data }: { id?: string; data: PatientInput }) =>
      id ? api.put<Patient>(`/api/patients/${id}`, data) : api.post<Patient>("/api/patients", data),
    invalidate: affects.patients,
    success: (_p, v) => (v.id ? "Patient updated successfully." : "Patient created successfully."),
  });
}

export function useDeletePatient() {
  return useApiMutation({
    mutationFn: (id: string) => api.delete(`/api/patients/${id}`),
    invalidate: affects.patients,
    success: "Patient deleted.",
  });
}

export function useUpdateTeeth(patientId: string) {
  return useApiMutation({
    mutationFn: (data: ToothUpdateInput) => api.put<Patient>(`/api/patients/${patientId}/teeth`, data),
    invalidate: [qk.patient(patientId)],
    success: (_p, v) => `${v.teeth.length} tooth record${v.teeth.length > 1 ? "s" : ""} updated.`,
  });
}

export function useAddNote(patientId: string) {
  return useApiMutation({
    mutationFn: (text: string) => api.post<PatientNote>(`/api/patients/${patientId}/notes`, { text }),
    invalidate: [qk.patient(patientId)],
    success: "Note added.",
  });
}

export function useDeleteNote(patientId: string) {
  return useApiMutation({
    mutationFn: (noteId: string) => api.delete(`/api/patients/${patientId}/notes/${noteId}`),
    invalidate: [qk.patient(patientId)],
    success: "Note deleted.",
  });
}

export function useAddDocument(patientId: string) {
  return useApiMutation({
    mutationFn: (data: PatientDocumentInput) => api.post<PatientDocument>(`/api/patients/${patientId}/documents`, data),
    invalidate: [qk.patient(patientId)],
    success: "Document record added.",
  });
}

export function useDeleteDocument(patientId: string) {
  return useApiMutation({
    mutationFn: (docId: string) => api.delete(`/api/patients/${patientId}/documents/${docId}`),
    invalidate: [qk.patient(patientId)],
    success: "Document record removed.",
  });
}
