"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  FilePlus2,
  Mail,
  Pencil,
  Phone,
  Pill,
  ReceiptText,
  ClipboardPlus,
} from "lucide-react";
import type { Treatment } from "@/types";
import type { PatientProfile as Profile, InvoiceView } from "@/types/views";
import type { BookingDentist, BookingService } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToneBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { AppointmentDetailSheet } from "@/components/appointments/appointment-detail-sheet";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { DentalChart } from "@/components/patients/dental-chart";
import { TreatmentFormDialog, type ServiceTemplate } from "@/components/forms/treatment-form-dialog";
import { PrescriptionFormDialog } from "@/components/forms/prescription-form-dialog";
import { InvoiceFormDialog, type BillableService, type BillableTreatment } from "@/components/forms/invoice-form-dialog";
import { PaymentDialog } from "@/components/forms/payment-dialog";
import { CollectPaymentDialog } from "@/components/forms/collect-payment-dialog";
import { useDeleteTreatment } from "@/lib/query";
import { ageFrom } from "@/lib/utils/time";
import { initials } from "@/lib/utils";
import { OverviewTab } from "./overview-tab";
import { AppointmentsTab, BillingTab, PrescriptionsTab, TreatmentsTab } from "./records-tabs";
import { DocumentsTab, NotesTab } from "./notes-documents";

const TABS = ["overview", "appointments", "dental", "treatments", "prescriptions", "billing", "documents", "notes"] as const;
type Tab = (typeof TABS)[number];

export function PatientProfile({
  profile,
  initialTab,
  lookups,
  serviceTemplates,
  billable,
  taxRate,
}: {
  profile: Profile;
  initialTab?: string;
  lookups: { services: BookingService[]; dentists: BookingDentist[]; patients: PatientOption[] };
  serviceTemplates: ServiceTemplate[];
  billable: { services: BillableService[]; treatments: BillableTreatment[] };
  taxRate: number;
}) {
  const { patient } = profile;
  const [tab, setTab] = React.useState<Tab>(TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "overview");
  // Mutations invalidate the TanStack Query cache, so no manual refresh is needed.
  const refresh = React.useCallback(() => undefined, []);
  const deleteTreatmentMutation = useDeleteTreatment();

  // dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [apptOpen, setApptOpen] = React.useState(false);
  const [viewAppt, setViewAppt] = React.useState<string | null>(null);
  const [treatment, setTreatment] = React.useState<{ open: boolean; value: Treatment | null }>({ open: false, value: null });
  const [deleteTreatment, setDeleteTreatment] = React.useState<Treatment | null>(null);
  const [rx, setRx] = React.useState<{ open: boolean; value: Profile["prescriptions"][number] | null }>({ open: false, value: null });
  const [invoice, setInvoice] = React.useState<{ open: boolean; value: InvoiceView | null }>({ open: false, value: null });
  const [payment, setPayment] = React.useState<{ invoice: InvoiceView | null; type: "PAYMENT" | "REFUND" }>({ invoice: null, type: "PAYMENT" });
  const [collect, setCollect] = React.useState<InvoiceView | null>(null);

  const patientOption: PatientOption = { id: patient.id, name: patient.name, phone: patient.phone, email: patient.email };
  const patientsForForms = lookups.patients.some((p) => p.id === patient.id) ? lookups.patients : [patientOption, ...lookups.patients];
  const invoiceViews: InvoiceView[] = profile.invoices.map((i) => ({
    ...i,
    patientName: patient.name,
    patientPhone: patient.phone,
    patientEmail: patient.email,
    payments: profile.payments.filter((p) => p.invoiceId === i.id),
  }));
  const age = ageFrom(patient.dateOfBirth);

  function changeTab(v: string) {
    setTab(v as Tab);
    window.history.replaceState(null, "", `?tab=${v}`);
  }

  const removeTreatment = (t: Treatment) => deleteTreatmentMutation.mutateAsync(t.id);

  return (
    <>
      <Link href="/admin/patients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" aria-hidden /> Patients
      </Link>

      <div className="mb-6 flex flex-col gap-5 rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-base">{initials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{patient.name}</h1>
              <ToneBadge
                tone={
                  patient.status === "ACTIVE"
                    ? { label: "Active", color: "var(--status-completed)", bg: "var(--status-completed-bg)" }
                    : { label: "Inactive", color: "var(--status-pending)", bg: "var(--status-pending-bg)" }
                }
              />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{patient.id}</span>
              <span>
                {age !== null ? `${age} yrs` : "Age —"} · {patient.gender === "MALE" ? "Male" : patient.gender === "FEMALE" ? "Female" : "Other"}
              </span>
              <a href={`tel:${patient.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 hover:text-foreground">
                <Phone className="size-3.5" aria-hidden /> {patient.phone}
              </a>
              {patient.email && (
                <a href={`mailto:${patient.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Mail className="size-3.5" aria-hidden /> {patient.email}
                </a>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil /> Edit
          </Button>
          <Button variant="outline" onClick={() => setApptOpen(true)}>
            <CalendarPlus /> Book appointment
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <FilePlus2 /> Create <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setTreatment({ open: true, value: null })}>
                <ClipboardPlus /> Treatment plan
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRx({ open: true, value: null })}>
                <Pill /> Prescription
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInvoice({ open: true, value: null })}>
                <ReceiptText /> Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={tab} onValueChange={changeTab}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="h-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments ({profile.appointments.length})</TabsTrigger>
            <TabsTrigger value="dental">Dental history</TabsTrigger>
            <TabsTrigger value="treatments">Treatments ({profile.treatments.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({profile.prescriptions.length})</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="documents">Documents ({patient.documents.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({patient.notes.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab profile={profile} onOpenAppointment={setViewAppt} onGoTo={changeTab} />
        </TabsContent>
        <TabsContent value="appointments">
          <AppointmentsTab appointments={profile.appointments} onOpen={setViewAppt} onNew={() => setApptOpen(true)} />
        </TabsContent>
        <TabsContent value="dental">
          <div className="mb-4 rounded-xl border bg-white p-5 text-sm">
            <h2 className="font-semibold">Dental history</h2>
            <p className="mt-1.5 whitespace-pre-line text-muted-foreground">{patient.dentalHistory || "No dental history recorded."}</p>
          </div>
          <DentalChart patient={patient} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="treatments">
          <TreatmentsTab
            treatments={profile.treatments}
            onNew={() => setTreatment({ open: true, value: null })}
            onEdit={(t) => setTreatment({ open: true, value: t })}
            onDelete={setDeleteTreatment}
            onChanged={refresh}
          />
        </TabsContent>
        <TabsContent value="prescriptions">
          <PrescriptionsTab prescriptions={profile.prescriptions} onNew={() => setRx({ open: true, value: null })} onEdit={(p) => setRx({ open: true, value: p })} onChanged={refresh} />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab
            invoices={invoiceViews}
            summary={profile.summary}
            onNew={() => setInvoice({ open: true, value: null })}
            onEdit={(i) => setInvoice({ open: true, value: i })}
            onPay={(i, type) => (type === "COLLECT" ? setCollect(i) : setPayment({ invoice: i, type }))}
          />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab patient={patient} onChanged={refresh} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab patient={patient} onChanged={refresh} />
        </TabsContent>
      </Tabs>

      <PatientFormDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} onSaved={refresh} />
      <AppointmentFormDialog
        open={apptOpen}
        onOpenChange={setApptOpen}
        services={lookups.services}
        dentists={lookups.dentists}
        patients={patientsForForms}
        defaults={{ patientId: patient.id, patientName: patient.name, phone: patient.phone, email: patient.email }}
        onCreated={refresh}
      />
      <AppointmentDetailSheet
        appointment={profile.appointments.find((a) => a.id === viewAppt) ?? null}
        dentists={lookups.dentists}
        open={Boolean(viewAppt)}
        onOpenChange={(o) => !o && setViewAppt(null)}
        onUpdated={refresh}
      />
      <TreatmentFormDialog
        open={treatment.open}
        onOpenChange={(o) => setTreatment((s) => ({ ...s, open: o }))}
        treatment={treatment.value}
        patients={patientsForForms}
        dentists={lookups.dentists}
        services={serviceTemplates}
        fixedPatientId={patient.id}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={Boolean(deleteTreatment)}
        onOpenChange={(o) => !o && setDeleteTreatment(null)}
        title="Delete treatment plan?"
        onConfirm={() => removeTreatment(deleteTreatment!)}
      />
      <PrescriptionFormDialog
        open={rx.open}
        onOpenChange={(o) => setRx((s) => ({ ...s, open: o }))}
        prescription={rx.value}
        patients={patientsForForms}
        dentists={lookups.dentists}
        fixedPatientId={patient.id}
        onSaved={refresh}
      />
      <InvoiceFormDialog
        open={invoice.open}
        onOpenChange={(o) => setInvoice((s) => ({ ...s, open: o }))}
        invoice={invoice.value}
        patients={patientsForForms}
        services={billable.services}
        treatments={billable.treatments}
        defaultTaxRate={taxRate}
        fixedPatientId={patient.id}
        onSaved={refresh}
      />
      <CollectPaymentDialog open={Boolean(collect)} onOpenChange={(o) => !o && setCollect(null)} invoice={collect} />
      <PaymentDialog
        open={Boolean(payment.invoice)}
        onOpenChange={(o) => !o && setPayment((s) => ({ ...s, invoice: null }))}
        invoice={payment.invoice}
        defaultType={payment.type}
        onSaved={refresh}
      />
    </>
  );
}
