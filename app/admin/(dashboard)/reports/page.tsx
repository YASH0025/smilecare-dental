import type { Metadata } from "next";
import { ReportsScreen } from "@/components/admin/reports-screen";

export const metadata: Metadata = { title: "Reports" };

type Props = { searchParams: Promise<{ from?: string; to?: string }> };

const valid = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function ReportsPage({ searchParams }: Props) {
  const { from, to } = await searchParams;
  return <ReportsScreen from={valid(from)} to={valid(to)} />;
}
