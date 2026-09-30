import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <>
      <PageHeader title="Settings" description="Clinic information, booking rules and website content. Changes go live immediately." />
      <SettingsTabs initialTab={tab} />
    </>
  );
}
