import type { Metadata } from "next";
import { LeadsScreen } from "@/components/admin/cms/leads-manager";

export const metadata: Metadata = { title: "Leads" };

export default function AdminLeadsScreenPage() {
  return <LeadsScreen />;
}
