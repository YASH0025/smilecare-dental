"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { PAYMENT_METHODS } from "@/types";
import type { InvoiceView } from "@/types/views";
import { paymentSchema, type PaymentInput } from "@/lib/validations/billing";
import { useRecordPayment } from "@/lib/query";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency, toDateKey } from "@/lib/utils";
import { NumberInput } from "./fields";

export function PaymentDialog({
  open,
  onOpenChange,
  invoice,
  defaultType = "PAYMENT",
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice: InvoiceView | null;
  defaultType?: "PAYMENT" | "REFUND";
  onSaved?: (i: InvoiceView) => void;
}) {
  const form = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "UPI", type: "PAYMENT", date: toDateKey(new Date()), reference: "", notes: "" },
  });
  const type = form.watch("type");
  const recordPayment = useRecordPayment();

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      amount: defaultType === "PAYMENT" ? invoice.balance : invoice.paid,
      method: "UPI",
      type: defaultType,
      date: toDateKey(new Date()),
      reference: "",
      notes: "",
    });
  }, [open, invoice, defaultType, form]);

  async function onSubmit(values: PaymentInput) {
    if (!invoice) return;
    try {
      const updated = await recordPayment.mutateAsync({ invoiceId: invoice.id, data: values });
      onSaved?.(updated);
      onOpenChange(false);
    } catch {
      /* toast shown by the mutation */
    }
  }

  const max = invoice ? (type === "PAYMENT" ? invoice.balance : invoice.paid) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "PAYMENT" ? "Record payment" : "Issue refund"}</DialogTitle>
          <DialogDescription>
            {invoice && (
              <>
                {invoice.number} · {invoice.patientName} · {type === "PAYMENT" ? "Balance" : "Refundable"} {formatCurrency(max, true)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    if (invoice) form.setValue("amount", v === "PAYMENT" ? invoice.balance : invoice.paid);
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  {(["PAYMENT", "REFUND"] as const).map((t) => (
                    <Label key={t} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/50">
                      <RadioGroupItem value={t} disabled={t === "PAYMENT" ? invoice?.balance === 0 : !invoice?.paid} />
                      {t === "PAYMENT" ? "Payment" : "Refund"}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <NumberInput min={0} step="0.01" value={field.value} onChange={field.onChange} />
                    </FormControl>
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
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {PAYMENT_METHOD_LABELS[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="UTR / txn ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant={type === "REFUND" ? "destructive" : "default"} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : type === "PAYMENT" ? "Record payment" : "Issue refund"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
