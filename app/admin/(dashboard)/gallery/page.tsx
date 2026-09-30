import type { Metadata } from "next";
import { GalleryScreen } from "@/components/admin/cms/gallery-manager";

export const metadata: Metadata = { title: "Gallery" };

export default function AdminGalleryScreenPage() {
  return <GalleryScreen />;
}
