"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { InvoiceView } from "@/types/views";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations/billing";
import { useSaveInvoice } from "@/lib/query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, toDateKey } from "@/lib/utils";
import { NumberInput, PatientPicker } from "./fields";

export type BillableService = { id: string; name: string; price: number };
export type BillableTreatment = { id: string; patientId: string; title: string; cost: number };

const lid = () => Math.random().toString(36).slice(2, 8);

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  patients,
  services,
  treatments,
  defaultTaxRate,
  fixedPatientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice?: InvoiceView | null;
  patients: PatientOption[];
  services: BillableService[];
  treatments: BillableTreatment[];
  defaultTaxRate: number;
  fixedPatientId?: string;
  onSaved?: (i: InvoiceView) => void;
}) {
  const blank: InvoiceInput = {
    patientId: fixedPatientId ?? "",
    date: toDateKey(new Date()),
    dueDate: toDateKey(addDays(new Date(), 15)),
    items: [{ id: lid(), description: "", quantity: 1, price: 0, discount: 0 }],
    taxRate: defaultTaxRate,
    notes: "",
    status: "UNPAID",
  };
  const form = useForm<InvoiceInput>({ resolver: zodResolver(invoiceSchema), defaultValues: blank });
  const items = useFieldArray({ control: form.control, name: "items" });
  const saveInvoice = useSaveInvoice();
  const watched = useWatch({ control: form.control, name: ["items", "taxRate", "patientId"] });
  const [lineItems, taxRate, patientId] = watched as [InvoiceInput["items"], number, string];

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      invoice
        ? {
            patientId: invoice.patientId,
            date: invoice.date,
            dueDate: invoice.dueDate,
            items: invoice.items,
            taxRate: invoice.taxRate,
            notes: invoice.notes,
            status: invoice.status === "DRAFT" ? "DRAFT" : "UNPAID",
          }
        : blank,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice]);

  const subtotal = (lineItems ?? []).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const discount = (lineItems ?? []).reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * (Number(taxRate) || 0)) / 100;
  const total = taxable + tax;
  const patientTreatments = treatments.filter((t) => t.patientId === patientId);

  function addFrom(kind: "service" | "treatment", id: string) {
    if (kind === "service") {
      const s = services.find((x) => x.id === id);
      if (s) items.append({ id: lid(), description: s.name, serviceId: s.id, quantity: 1, price: s.price, discount: 0 });
    } else {
      const t = treatments.find((x) => x.id === id);
      if (t) items.append({ id: lid(), description: t.title, treatmentId: t.id, quantity: 1, price: t.cost, discount: 0 });
    }
    // drop an untouched empty first row
    const first = form.getValues("items.0");
    if (first && !first.description && !first.price && form.getValues("items").length > 1) items.remove(0);
  }

  async function save(status: "DRAFT" | "UNPAID") {
    form.setValue("status", status);
    await form.handleSubmit(async (values) => {
      try {
        const saved = await saveInvoice.mutateAsync({ id: invoice?.id, data: values });
        onSaved?.(saved);
        onOpenChange(false);
      } catch {
        /* toast shown by the mutation */
      }
    })();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{invoice ? `Edit invoice ${invoice.number}` : "New invoice"}</DialogTitle>
          <DialogDescription>Line discounts are flat amounts applied before tax.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Patient</FormLabel>
                    <PatientPicker patients={patients} value={field.value} onChange={field.onChange} disabled={Boolean(fixedPatientId || invoice)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value="" onValueChange={(v) => addFrom("service", v)}>
                <SelectTrigger className="w-[220px]" size="sm">
                  <SelectValue placeholder="+ Add service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {formatCurrency(s.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value="" onValueChange={(v) => addFrom("treatment", v)} disabled={!patientTreatments.length}>
                <SelectTrigger className="w-[240px]" size="sm">
                  <SelectValue placeholder={patientTreatments.length ? "+ Add from treatment plan" : "No treatment plans"} />
                </SelectTrigger>
                <SelectContent>
                  {patientTreatments.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} · {formatCurrency(t.cost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" onClick={() => items.append({ id: lid(), description: "", quantity: 1, price: 0, discount: 0 })}>
                <Plus /> Custom line
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-canvas text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Treatment / item</th>
                    <th className="w-20 px-2 py-2 text-left font-medium">Qty</th>
                    <th className="w-32 px-2 py-2 text-left font-medium">Price</th>
                    <th className="w-28 px-2 py-2 text-left font-medium">Discount</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.fields.map((f, i) => {
                    const row = lineItems?.[i];
                    const amount = row ? (Number(row.quantity) || 0) * (Number(row.price) || 0) - (Number(row.discount) || 0) : 0;
                    return (
                      <tr key={f.id} className="border-t align-top">
                        <td className="px-3 py-2">
                          <FormField
                            control={form.control}
                            name={`items.${i}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input aria-label="Description" placeholder="Description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        {(["quantity", "price", "discount"] as const).map((k) => (
                          <td key={k} className="px-2 py-2">
                            <FormField
                              control={form.control}
                              name={`items.${i}.${k}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <NumberInput aria-label={k} min={k === "quantity" ? 1 : 0} value={field.value} onChange={field.onChange} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                        ))}
                        <td className="px-3 py-4 text-right font-medium tabular-nums">{formatCurrency(amount)}</td>
                        <td className="py-2 pr-2">
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => items.remove(i)} disabled={items.fields.length <= 1} aria-label="Remove line">
                            <Trash2 />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(form.formState.errors.items?.message || form.formState.errors.items?.root?.message) && (
              <p className="text-xs text-destructive">{form.formState.errors.items?.message ?? form.formState.errors.items?.root?.message}</p>
            )}

            <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Payment terms, remarks…" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <dl className="space-y-2 rounded-lg border bg-canvas p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatCurrency(subtotal, true)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="tabular-nums">− {formatCurrency(discount, true)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Tax %</dt>
                  <dd className="w-20">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => <NumberInput aria-label="Tax rate" className="h-8 text-right" min={0} max={28} value={field.value} onChange={field.onChange} />}
                    />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="tabular-nums">{formatCurrency(tax, true)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatCurrency(total, true)}</dd>
                </div>
                {invoice && invoice.paid > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <dt>Already paid</dt>
                    <dd className="tabular-nums">{formatCurrency(invoice.paid, true)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              {(!invoice || invoice.status === "DRAFT") && (
                <Button type="button" variant="secondary" onClick={() => save("DRAFT")} disabled={form.formState.isSubmitting}>
                  Save as draft
                </Button>
              )}
              <Button type="button" onClick={() => save("UNPAID")} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : invoice && invoice.status !== "DRAFT" ? "Save changes" : "Issue invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
