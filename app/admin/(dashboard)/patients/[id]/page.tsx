import type { Metadata } from "next";
import { patientService } from "@/lib/services";
import { PatientProfileScreen } from "@/components/patients/profile/patient-profile-screen";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await patientService.get(id);
    return { title: p.name };
  } catch {
    return { title: "Patient" };
  }
}

export default async function PatientDetailPage({ params, searchParams }: Props) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  return <PatientProfileScreen id={id} initialTab={tab} />;
}
