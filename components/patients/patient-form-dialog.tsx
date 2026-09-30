"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Patient } from "@/types";
import { patientSchema, type PatientInput } from "@/lib/validations/patient";
import { useSavePatient } from "@/lib/query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY: PatientInput = {
  name: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  gender: "FEMALE",
  address: "",
  bloodGroup: "",
  allergies: "",
  medicalHistory: "",
  dentalHistory: "",
  emergencyContact: "",
  status: "ACTIVE",
};

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patient?: Patient | null;
  onSaved?: (p: Patient) => void;
}) {
  const form = useForm<PatientInput>({ resolver: zodResolver(patientSchema), defaultValues: EMPTY });
  const savePatient = useSavePatient();

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      patient
        ? {
            name: patient.name,
            phone: patient.phone,
            email: patient.email,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
            bloodGroup: patient.bloodGroup ?? "",
            allergies: patient.allergies,
            medicalHistory: patient.medicalHistory,
            dentalHistory: patient.dentalHistory,
            emergencyContact: patient.emergencyContact ?? "",
            status: patient.status,
          }
        : EMPTY,
    );
  }, [open, patient, form]);

  async function onSubmit(values: PatientInput) {
    try {
      const saved = await savePatient.mutateAsync({ id: patient?.id, data: values });
      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      /* error toast shown by the mutation; keep the dialog open */
    }
  }

  const text = (name: keyof PatientInput, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const area = (name: keyof PatientInput, label: string, placeholder?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea rows={2} placeholder={placeholder} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{patient ? `Edit ${patient.name}` : "New patient"}</DialogTitle>
          <DialogDescription>Demo system — use fictional information only.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("name", "Full name", { autoComplete: "off" })}
              {text("phone", "Mobile", { type: "tel" })}
              {text("email", "Email", { type: "email" })}
              {text("dateOfBirth", "Date of birth", { type: "date" })}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="OTHER">Other / not specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                {text("bloodGroup", "Blood group", { placeholder: "O+" })}
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
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="sm:col-span-2">{text("address", "Address")}</div>
              {text("emergencyContact", "Emergency contact")}
              {text("allergies", "Allergies", { placeholder: "None known" })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {area("medicalHistory", "Medical history", "Conditions, medications…")}
              {area("dentalHistory", "Dental history", "Previous treatments, concerns…")}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : patient ? "Save changes" : "Create patient"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
