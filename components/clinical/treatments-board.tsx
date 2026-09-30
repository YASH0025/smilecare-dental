"use client";

import * as React from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { TREATMENT_STATUSES, type Treatment } from "@/types";
import type { TreatmentView } from "@/types/views";
import type { BookingDentist } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TreatmentFormDialog, type ServiceTemplate } from "@/components/forms/treatment-form-dialog";
import { TREATMENT_STATUS_META } from "@/lib/constants";
import { combineQueries, useDeleteTreatment, useLookups, useTreatments } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { TreatmentCard } from "./treatment-card";

export function TreatmentsScreen() {
  const query = combineQueries(useTreatments(), useLookups());
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load treatment plans"
      loading={
        <>
          <PageHeader title="Treatment plans" description="Loading treatment plans…" />
          <CardGridSkeleton count={4} className="lg:grid-cols-2" />
        </>
      }
    >
      {([treatments, lookups]) => (
        <TreatmentsBoard
          treatments={treatments}
          patients={lookups.patients}
          dentists={lookups.dentists}
          templates={lookups.fullServices.map((s) => ({ id: s.id, name: s.name, price: s.price, procedure: s.procedure.map((p) => ({ title: p.title })) }))}
        />
      )}
    </RenderContent>
  );
}

function TreatmentsBoard({
  treatments,
  patients,
  dentists,
  templates,
}: {
  treatments: TreatmentView[];
  patients: PatientOption[];
  dentists: BookingDentist[];
  templates: ServiceTemplate[];
}) {
  const deleteTreatment = useDeleteTreatment();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("ACTIVE");
  const [form, setForm] = React.useState<{ open: boolean; value: Treatment | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Treatment | null>(null);

  const filtered = treatments.filter((t) => {
    const needle = q.toLowerCase().trim();
    const statusOk = status === "ALL" || (status === "ACTIVE" ? t.status === "PLANNED" || t.status === "IN_PROGRESS" : t.status === status);
    return statusOk && (!needle || t.title.toLowerCase().includes(needle) || t.patientName.toLowerCase().includes(needle) || t.id.toLowerCase().includes(needle));
  });
  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(filtered, 8);

  const remove = (t: Treatment) => deleteTreatment.mutateAsync(t.id);

  const counts = {
    ACTIVE: treatments.filter((t) => t.status === "PLANNED" || t.status === "IN_PROGRESS").length,
    ALL: treatments.length,
    ...Object.fromEntries(TREATMENT_STATUSES.map((s) => [s, treatments.filter((t) => t.status === s).length])),
  } as Record<string, number>;

  return (
    <>
      <PageHeader
        title="Treatment plans"
        description="Track multi-visit treatments step by step. Ticking steps updates the plan status automatically."
        actions={
          <Button onClick={() => setForm({ open: true, value: null })}>
            <Plus /> New treatment plan
          </Button>
        }
      />
      <TableCard className="mb-6">
        <DataToolbar search={q} onSearch={setQ} placeholder="Search plan, patient or ID" className="border-b-0">
          <Tabs value={status} onValueChange={setStatus}>
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="ACTIVE">Active ({counts.ACTIVE})</TabsTrigger>
              {TREATMENT_STATUSES.map((s) => (
                <TabsTrigger key={s} value={s}>
                  {TREATMENT_STATUS_META[s].label} ({counts[s]})
                </TabsTrigger>
              ))}
              <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            </TabsList>
          </Tabs>
          {q && (
            <Button variant="ghost" onClick={() => setQ("")}>
              <X /> Clear
            </Button>
          )}
        </DataToolbar>
      </TableCard>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState
            icon={ClipboardList}
            title="No treatment plans found"
            description="Try another status or search term."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setStatus("ALL");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {pageItems.map((t) => (
              <TreatmentCard
                key={t.id}
                treatment={t}
                patientName={t.patientName}
                dentistName={t.dentistName}
                onEdit={() => setForm({ open: true, value: t })}
                onDelete={() => setDeleting(t)}
              />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="mt-4 rounded-xl border bg-white">
              <Pagination className="border-t-0" page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <TreatmentFormDialog
        open={form.open}
        onOpenChange={(o) => setForm((s) => ({ ...s, open: o }))}
        treatment={form.value}
        patients={patients}
        dentists={dentists}
        services={templates}
      />
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete treatment plan?" onConfirm={() => remove(deleting!)} />
    </>
  );
}
