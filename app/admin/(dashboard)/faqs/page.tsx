import type { Metadata } from "next";
import { FaqsScreen } from "@/components/admin/cms/faqs-manager";

export const metadata: Metadata = { title: "FAQs" };

export default function AdminFaqsScreenPage() {
  return <FaqsScreen />;
}
