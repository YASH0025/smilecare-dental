"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { TREATMENT_STATUSES, type Treatment } from "@/types";
import type { BookingDentist } from "@/components/booking/types";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { treatmentSchema, type TreatmentInput } from "@/lib/validations/clinical";
import { useSaveTreatment } from "@/lib/query";
import { TREATMENT_STATUS_META } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toDateKey } from "@/lib/utils";
import { NumberInput, PatientPicker } from "./fields";

export type ServiceTemplate = { id: string; name: string; price: number; procedure: { title: string }[] };

const sid = () => Math.random().toString(36).slice(2, 8);

export function TreatmentFormDialog({
  open,
  onOpenChange,
  treatment,
  patients,
  dentists,
  services,
  fixedPatientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  treatment?: Treatment | null;
  patients: PatientOption[];
  dentists: Pick<BookingDentist, "id" | "name">[];
  services: ServiceTemplate[];
  fixedPatientId?: string;
  onSaved?: (t: Treatment) => void;
}) {
  const blank: TreatmentInput = {
    patientId: fixedPatientId ?? "",
    dentistId: dentists[0]?.id ?? "",
    serviceId: undefined,
    title: "",
    teeth: [],
    steps: [
      { id: sid(), label: "Consultation", done: false },
      { id: sid(), label: "Follow-up", done: false },
    ],
    cost: 0,
    status: "PLANNED",
    startDate: toDateKey(new Date()),
    endDate: "",
    followUpDate: "",
    notes: "",
  };
  const form = useForm<TreatmentInput>({ resolver: zodResolver(treatmentSchema), defaultValues: blank });
  const steps = useFieldArray({ control: form.control, name: "steps" });
  const saveTreatment = useSaveTreatment();
  const [teethText, setTeethText] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (treatment) {
      form.reset({
        patientId: treatment.patientId,
        dentistId: treatment.dentistId,
        serviceId: treatment.serviceId,
        title: treatment.title,
        teeth: treatment.teeth,
        steps: treatment.steps,
        cost: treatment.cost,
        status: treatment.status,
        startDate: treatment.startDate,
        endDate: treatment.endDate ?? "",
        followUpDate: treatment.followUpDate ?? "",
        notes: treatment.notes,
      });
      setTeethText(treatment.teeth.join(", "));
    } else {
      form.reset(blank);
      setTeethText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, treatment]);

  function applyTemplate(serviceId: string) {
    const s = services.find((x) => x.id === serviceId);
    form.setValue("serviceId", serviceId);
    if (!s) return;
    if (!form.getValues("title")) form.setValue("title", s.name);
    if (!form.getValues("cost")) form.setValue("cost", s.price);
    if (s.procedure.length) {
      form.setValue(
        "steps",
        s.procedure.map((p) => ({ id: sid(), label: p.title.slice(0, 80), done: false })),
      );
    }
  }

  async function onSubmit(values: TreatmentInput) {
    const teeth = teethText
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = { ...values, teeth };
    try {
      const saved = await saveTreatment.mutateAsync({ id: treatment?.id, data: payload });
      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      /* toast shown by the mutation */
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{treatment ? "Edit treatment plan" : "New treatment plan"}</DialogTitle>
          <DialogDescription>Plan steps are ticked off as the treatment progresses; status updates automatically.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <FormLabel>Dentist</FormLabel>
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
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Based on service</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={applyTemplate}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional — prefills steps & cost" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan title</FormLabel>
                    <FormControl>
                      <Input placeholder="Root Canal Treatment — 36" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <FormLabel>Treatment steps</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={() => steps.append({ id: sid(), label: "", done: false })}>
                  <Plus /> Add step
                </Button>
              </div>
              <ol className="space-y-2">
                {steps.fields.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
                    <FormField
                      control={form.control}
                      name={`steps.${i}.done`}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(Boolean(c))} aria-label={`Step ${i + 1} done`} />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`steps.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Step ${i + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => steps.remove(i)} aria-label={`Remove step ${i + 1}`} disabled={steps.fields.length <= 1}>
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ol>
              {form.formState.errors.steps?.message && <p className="mt-2 text-xs text-destructive">{form.formState.errors.steps.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated cost (₹)</FormLabel>
                    <FormControl>
                      <NumberInput min={0} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TREATMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {TREATMENT_STATUS_META[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel htmlFor="teeth-input">Teeth (FDI)</FormLabel>
                <Input id="teeth-input" value={teethText} onChange={(e) => setTeethText(e.target.value)} placeholder="36, 37" />
              </FormItem>
              {(["startDate", "endDate", "followUpDate"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{{ startDate: "Start date", endDate: "End date", followUpDate: "Follow-up" }[name]}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Visible to clinic staff only.</FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : treatment ? "Save changes" : "Create plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
