import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { settingsService } from "@/lib/services";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · SmileCare Admin" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defence in depth: proxy.ts already redirects, but never render admin UI without a session.
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const settings = await settingsService.get();
  return (
    <AdminShell user={{ name: session.name, email: session.email }} clinicName={settings.city}>
      {children}
    </AdminShell>
  );
}
