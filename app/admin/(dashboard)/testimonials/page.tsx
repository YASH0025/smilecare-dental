import type { Metadata } from "next";
import { TestimonialsScreen } from "@/components/admin/cms/testimonials-manager";

export const metadata: Metadata = { title: "Testimonials" };

export default function AdminTestimonialsScreenPage() {
  return <TestimonialsScreen />;
}
