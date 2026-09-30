import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prescriptionService, settingsService } from "@/lib/services";
import { PrescriptionDocument } from "@/components/clinical/prescription-document";
import { PrintToolbar } from "@/components/clinical/print-toolbar";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Prescription ${(await params).id}` };
}

export default async function PrintPrescriptionPage({ params }: Props) {
  const { id } = await params;
  const [rx, settings] = await Promise.all([prescriptionService.get(id).catch(() => null), settingsService.get()]);
  if (!rx) notFound();
  return (
    <>
      <PrintToolbar label={`Prescription ${rx.id} · ${rx.patientName}`} />
      <PrescriptionDocument rx={rx} clinic={settings} />
    </>
  );
}
