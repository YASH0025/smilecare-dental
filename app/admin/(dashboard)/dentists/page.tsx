import type { Metadata } from "next";
import { DentistsScreen } from "@/components/admin/cms/dentists-manager";

export const metadata: Metadata = { title: "Dentists" };

export default function AdminDentistsScreenPage() {
  return <DentistsScreen />;
}
