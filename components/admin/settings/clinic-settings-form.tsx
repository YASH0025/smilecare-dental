"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSaveSettings } from "@/lib/query";
import type { ClinicSettings } from "@/types";
import { settingsSchema, type SettingsInput } from "@/lib/validations/cms";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "@/components/forms/fields";
import { ImageInput } from "@/components/forms/cms-inputs";
import { SettingsSection, StickySaveBar } from "./section";

export function ClinicSettingsForm({ settings }: { settings: ClinicSettings }) {
  const saveSettings = useSaveSettings();
  const form = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: settings });
  const hours = useFieldArray({ control: form.control, name: "openingHours" });

  React.useEffect(() => form.reset(settings), [settings, form]);

  async function onSubmit(values: SettingsInput) {
    try {
      await saveSettings.mutateAsync(values);
      form.reset(values);
    } catch {
      /* toast shown by the mutation */
    }
  }

  const text = (name: keyof SettingsInput, label: string, props: React.ComponentProps<typeof Input> = {}, description?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields."))} noValidate>
        <SettingsSection title="Clinic identity" description="Shown in the header, footer, invoices and prescriptions.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("name", "Clinic name")}
            {text("tagline", "Tagline")}
            {text("logoText", "Logo text")}
          </div>
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo image (optional)</FormLabel>
                <ImageInput value={field.value} onChange={field.onChange} aspect="aspect-square" />
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Contact details" description="Used on the contact page and in patient communications.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("phone", "Phone", { type: "tel" })}
            {text("whatsapp", "WhatsApp", { type: "tel" })}
            {text("email", "Email", { type: "email" })}
            {text("emergencyContact", "Emergency contact", { type: "tel" })}
            {text("city", "City")}
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4">
            {text("googleMapsUrl", "Google Maps link")}
            {text("googleMapsEmbedUrl", "Google Maps embed URL", {}, "Used for the map on the contact page (…&output=embed).")}
          </div>
        </SettingsSection>

        <SettingsSection title="Opening hours" description="Displayed on the website. Bookable slots come from each dentist's working hours.">
          <div className="space-y-2">
            {hours.fields.map((h, i) => (
              <div key={h.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <FormField
                  control={form.control}
                  name={`openingHours.${i}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input aria-label="Days" placeholder="Monday – Saturday" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`openingHours.${i}.hours`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input aria-label="Hours" placeholder="10:00 AM – 7:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => hours.remove(i)} disabled={hours.fields.length <= 1} aria-label="Remove row">
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => hours.append({ label: "", hours: "" })} disabled={hours.fields.length >= 7}>
            <Plus /> Add row
          </Button>
        </SettingsSection>

        <SettingsSection title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["instagram", "facebook", "youtube", "linkedin"] as const).map((k) => (
              <FormField
                key={k}
                control={form.control}
                name={`social.${k}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{k}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Booking & billing" description="Controls online slot generation and invoice defaults.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="slotInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot interval</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[15, 20, 30, 60].map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          Every {m} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Start times offered to patients.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingWindowDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking window (days)</FormLabel>
                  <FormControl>
                    <NumberInput min={7} max={180} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>How far ahead patients can book online.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default tax rate (%)</FormLabel>
                  <FormControl>
                    <NumberInput min={0} max={28} step="0.5" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Healthcare services are generally GST-exempt; set if applicable.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {text("invoicePrefix", "Invoice number prefix", { maxLength: 10 }, "e.g. SC → SC-2026-0001")}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Payments (UPI)"
          description="Used to generate the UPI QR code when collecting a payment. Money goes straight to this UPI ID — double-check it."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {text("upiId", "Clinic UPI ID", { placeholder: "clinicname@okhdfcbank", autoComplete: "off" }, "Leave empty to hide the UPI QR option.")}
            {text("upiPayeeName", "Payee name", { placeholder: "SmileCare Dental Clinic" }, "Shown in the patient's UPI app.")}
          </div>
        </SettingsSection>

        <StickySaveBar dirty={form.formState.isDirty} saving={form.formState.isSubmitting} onReset={() => form.reset(settings)} />
      </form>
    </Form>
  );
}
