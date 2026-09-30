"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { combineQueries, useLookups, usePatientProfile, useSettings, useTreatments } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { RenderContent } from "@/components/shared/render-content";
import { ProfileSkeleton } from "@/components/shared/skeletons";
import { PatientProfile } from "./patient-profile";

/** Loads the profile bundle + form lookups; RenderContent manages loading and errors. */
export function PatientProfileScreen({ id, initialTab }: { id: string; initialTab?: string }) {
  const profile = usePatientProfile(id);
  const query = combineQueries(profile, useLookups(), useTreatments(), useSettings());

  if (profile.error instanceof ApiClientError && profile.error.status === 404) {
    return (
      <div className="rounded-xl border bg-white">
        <EmptyState
          icon={UserX}
          title="Patient not found"
          description={`No patient with ID ${id} exists. It may have been deleted.`}
          action={
            <Button asChild variant="outline">
              <Link href="/admin/patients">Back to patients</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <RenderContent query={query} loading={<ProfileSkeleton />} errorTitle="Couldn't load this patient">
      {([data, lookups, treatments, settings]) => (
        <PatientProfile
          profile={data}
          initialTab={initialTab}
          lookups={lookups}
          serviceTemplates={lookups.fullServices.map((s) => ({ id: s.id, name: s.name, price: s.price, procedure: s.procedure.map((p) => ({ title: p.title })) }))}
          billable={{
            services: lookups.fullServices.map((s) => ({ id: s.id, name: s.name, price: s.price })),
            treatments: treatments.filter((t) => t.patientId === id).map((t) => ({ id: t.id, patientId: t.patientId, title: t.title, cost: t.cost })),
          }}
          taxRate={settings.taxRate}
        />
      )}
    </RenderContent>
  );
}
