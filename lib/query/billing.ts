"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Payment, ReceiptEmailResult } from "@/types";
import type { InvoiceView } from "@/types/views";
import type { InvoiceInput, PaymentInput } from "@/lib/validations/billing";
import { api } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import { affects, qk } from "./keys";
import { useApiMutation } from "./mutation";

export type PaymentRow = Payment & { patientName: string; invoiceNumber: string };
export type RecordedPayment = InvoiceView & { receipt?: ReceiptEmailResult };

/** Tells staff whether the patient's receipt email went out (with the Ethereal preview link in test mode). */
export function showReceiptToast(receipt?: ReceiptEmailResult) {
  if (!receipt) return;
  if (receipt.status === "SENT") {
    const previewUrl = receipt.previewUrl;
    toast.success(`Receipt emailed to ${receipt.to}`, {
      description: previewUrl ? "Test mode (Ethereal) — open the preview to see the email." : undefined,
      action: previewUrl ? { label: "View email", onClick: () => window.open(previewUrl, "_blank", "noopener") } : undefined,
      duration: previewUrl ? 15_000 : 5_000,
    });
  } else if (receipt.status === "SKIPPED") {
    toast.info("No receipt sent — this patient has no email address.");
  } else {
    toast.warning("Payment saved, but the receipt email could not be sent.", { description: receipt.error });
  }
}

export function useInvoices() {
  return useQuery({ queryKey: qk.invoices(), queryFn: () => api.get<InvoiceView[]>("/api/invoices") });
}

export function usePayments() {
  return useQuery({ queryKey: qk.payments(), queryFn: () => api.get<PaymentRow[]>("/api/payments") });
}

export function useSaveInvoice() {
  return useApiMutation({
    mutationFn: ({ id, data }: { id?: string; data: InvoiceInput }) =>
      id ? api.put<InvoiceView>(`/api/invoices/${id}`, data) : api.post<InvoiceView>("/api/invoices", data),
    invalidate: affects.billing,
    success: (_i, v) => (v.id ? "Invoice updated successfully." : "Invoice created successfully."),
  });
}

export function useRecordPayment() {
  return useApiMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: PaymentInput }) =>
      api.post<RecordedPayment>(`/api/invoices/${invoiceId}/payments`, data),
    invalidate: affects.billing,
    success: (_i, v) => `${v.data.type === "PAYMENT" ? "Payment" : "Refund"} of ${formatCurrency(v.data.amount)} recorded.`,
    onSuccess: (result) => showReceiptToast(result.receipt),
  });
}

export function useCancelInvoice() {
  return useApiMutation({
    mutationFn: (id: string) => api.post<InvoiceView>(`/api/invoices/${id}/cancel`),
    invalidate: affects.billing,
    success: "Invoice cancelled.",
  });
}

export function useDeleteInvoice() {
  return useApiMutation({
    mutationFn: (id: string) => api.delete(`/api/invoices/${id}`),
    invalidate: affects.billing,
    success: "Invoice deleted.",
  });
}
