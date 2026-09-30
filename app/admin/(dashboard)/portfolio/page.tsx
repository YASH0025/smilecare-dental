import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/admin/cms/portfolio-manager";

export const metadata: Metadata = { title: "Portfolio" };

export default function AdminPortfolioScreenPage() {
  return <PortfolioScreen />;
}
