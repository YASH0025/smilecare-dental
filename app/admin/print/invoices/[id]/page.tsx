import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { billingService, settingsService } from "@/lib/services";
import { InvoiceDocument } from "@/components/clinical/invoice-document";
import { PrintToolbar } from "@/components/clinical/print-toolbar";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Invoice ${(await params).id}` };
}

export default async function PrintInvoicePage({ params }: Props) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([billingService.get(id).catch(() => null), settingsService.get()]);
  if (!invoice) notFound();
  return (
    <>
      <PrintToolbar label={`Invoice ${invoice.number} · ${invoice.patientName}`} />
      <InvoiceDocument invoice={invoice} clinic={settings} />
    </>
  );
}
