"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { BookingDentist, BookingService } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import type { Dentist, Service } from "@/types";
import type { PatientListItem } from "@/types/views";
import { api } from "@/lib/api/client";
import { combineQueries } from "./combine";
import { qk } from "./keys";

export type Lookups = {
  services: BookingService[];
  dentists: BookingDentist[];
  patients: PatientOption[];
  /** Full service records (procedure templates, published flag…) */
  fullServices: Service[];
};

/**
 * Option lists for admin pickers, derived from the shared services/dentists/patients caches
 * (so a CMS edit or new patient is reflected in every form automatically).
 */
export function useLookups() {
  const services = useQuery({ queryKey: qk.services(), queryFn: () => api.get<Service[]>("/api/services?all=1") });
  const dentists = useQuery({ queryKey: qk.dentists(), queryFn: () => api.get<Dentist[]>("/api/dentists?all=1") });
  const patients = useQuery({ queryKey: qk.patients(), queryFn: () => api.get<PatientListItem[]>("/api/patients") });
  const combined = combineQueries(services, dentists, patients);

  const data = React.useMemo<Lookups | undefined>(() => {
    if (!combined.data) return undefined;
    const [s, d, p] = combined.data;
    return {
      fullServices: s,
      services: s
        .map(({ id, name, category, duration, price, description }) => ({ id, name, category, duration, price, description }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      dentists: d
        .filter((x) => x.active)
        .map(({ id, name, photo, specialization, qualification, serviceIds, workingHours, leaves, experienceYears }) => ({
          id,
          name,
          photo,
          specialization,
          qualification,
          serviceIds,
          workingHours,
          leaves,
          experienceYears,
        })),
      patients: p
        .filter((x) => x.status === "ACTIVE")
        .map(({ id, name, phone, email }) => ({ id, name, phone, email }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [combined.data]);

  return { ...combined, data };
}
