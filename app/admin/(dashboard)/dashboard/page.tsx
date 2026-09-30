import type { Metadata } from "next";
import { DashboardScreen } from "@/components/admin/dashboard-screen";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardScreen />;
}
