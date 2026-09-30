import type { Metadata } from "next";
import { ServicesScreen } from "@/components/admin/cms/services-manager";

export const metadata: Metadata = { title: "Services" };

export default function AdminServicesScreenPage() {
  return <ServicesScreen />;
}
