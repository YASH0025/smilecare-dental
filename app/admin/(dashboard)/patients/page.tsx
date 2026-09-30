import type { Metadata } from "next";
import { PatientsTable } from "@/components/patients/patients-table";

export const metadata: Metadata = { title: "Patients" };

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { new: isNew } = await searchParams;
  return <PatientsTable openCreate={isNew === "1"} />;
}
