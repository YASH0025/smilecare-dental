import type { Metadata } from "next";
import { PrescriptionsScreen } from "@/components/clinical/prescriptions-table";

export const metadata: Metadata = { title: "Prescriptions" };

export default function PrescriptionsPage() {
  return <PrescriptionsScreen />;
}
