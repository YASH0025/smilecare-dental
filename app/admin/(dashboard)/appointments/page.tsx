import type { Metadata } from "next";
import { AppointmentsTable } from "@/components/appointments/appointments-table";

export const metadata: Metadata = { title: "Appointments" };

type Props = { searchParams: Promise<{ status?: string; q?: string; new?: string }> };

export default async function AppointmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <AppointmentsTable initialStatus={params.status} initialQuery={params.q} openCreate={params.new === "1"} />;
}
