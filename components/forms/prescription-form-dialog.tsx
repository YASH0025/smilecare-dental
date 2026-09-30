"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Prescription } from "@/types";
import type { BookingDentist } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { prescriptionSchema, type PrescriptionInput } from "@/lib/validations/clinical";
import { useSavePrescription } from "@/lib/query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toDateKey } from "@/lib/utils";
import { PatientPicker } from "./fields";

const EMPTY_MED = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };
const FREQUENCIES = ["Once daily", "Twice a day", "Three times a day", "Four times a day", "At bedtime", "When required"];

export function PrescriptionFormDialog({
  open,
  onOpenChange,
  prescription,
  patients,
  dentists,
  fixedPatientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prescription?: Prescription | null;
  patients: PatientOption[];
  dentists: Pick<BookingDentist, "id" | "name">[];
  fixedPatientId?: string;
  onSaved?: (p: Prescription) => void;
}) {
  const blank: PrescriptionInput = {
    patientId: fixedPatientId ?? "",
    dentistId: dentists[0]?.id ?? "",
    date: toDateKey(new Date()),
    diagnosis: "",
    medicines: [{ ...EMPTY_MED }],
    advice: "",
  };
  const form = useForm<PrescriptionInput>({ resolver: zodResolver(prescriptionSchema), defaultValues: blank });
  const meds = useFieldArray({ control: form.control, name: "medicines" });
  const savePrescription = useSavePrescription();

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      prescription
        ? {
            patientId: prescription.patientId,
            dentistId: prescription.dentistId,
            appointmentId: prescription.appointmentId,
            date: prescription.date,
            diagnosis: prescription.diagnosis,
            medicines: prescription.medicines,
            advice: prescription.advice,
          }
        : blank,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prescription]);

  async function onSubmit(values: PrescriptionInput) {
    try {
      const saved = await savePrescription.mutateAsync({ id: prescription?.id, data: values });
      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      /* toast shown by the mutation */
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{prescription ? `Edit prescription ${prescription.id}` : "New prescription"}</DialogTitle>
          <DialogDescription>Add each medicine with dosage, frequency and duration.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <PatientPicker patients={patients} value={field.value} onChange={field.onChange} disabled={Boolean(fixedPatientId)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dentistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescribed by</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dentist" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dentists.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Irreversible pulpitis — 36" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <FormLabel>Medicines</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={() => meds.append({ ...EMPTY_MED })}>
                  <Plus /> Add medicine
                </Button>
              </div>
              <div className="space-y-3">
                {meds.fields.map((m, i) => (
                  <fieldset key={m.id} className="rounded-lg border bg-canvas p-3">
                    <legend className="sr-only">Medicine {i + 1}</legend>
                    <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1.4fr_1fr_auto]">
                      <FormField
                        control={form.control}
                        name={`medicines.${i}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Medicine & strength" aria-label="Medicine" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medicines.${i}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Dosage" aria-label="Dosage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medicines.${i}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger aria-label="Frequency">
                                  <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FREQUENCIES.map((f) => (
                                  <SelectItem key={f} value={f}>
                                    {f}
                                  </SelectItem>
                                ))}
                                {field.value && !FREQUENCIES.includes(field.value) && <SelectItem value={field.value}>{field.value}</SelectItem>}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medicines.${i}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Duration" aria-label="Duration" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => meds.remove(i)} disabled={meds.fields.length <= 1} aria-label={`Remove medicine ${i + 1}`}>
                        <Trash2 />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`medicines.${i}.instructions`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-4">
                            <FormControl>
                              <Input placeholder="Instructions (e.g. after meals)" aria-label="Instructions" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </fieldset>
                ))}
              </div>
              {form.formState.errors.medicines?.message && <p className="mt-2 text-xs text-destructive">{form.formState.errors.medicines.message}</p>}
            </div>

            <FormField
              control={form.control}
              name="advice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advice</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Diet, hygiene, follow-up…" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : prescription ? "Save changes" : "Create prescription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
