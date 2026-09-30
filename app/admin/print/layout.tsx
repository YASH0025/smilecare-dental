import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/admin/login");
  return <main className="min-h-dvh bg-canvas px-4 py-8 print:bg-white print:p-0">{children}</main>;
}
