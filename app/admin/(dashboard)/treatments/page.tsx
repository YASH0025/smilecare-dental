import type { Metadata } from "next";
import { TreatmentsScreen } from "@/components/clinical/treatments-board";

export const metadata: Metadata = { title: "Treatments" };

export default function TreatmentsPage() {
  return <TreatmentsScreen />;
}
