import type { Metadata } from "next";
import { BillingScreen } from "@/components/clinical/billing-view";

export const metadata: Metadata = { title: "Billing" };

type Props = { searchParams: Promise<{ status?: string; q?: string; new?: string }> };

export default async function BillingPage({ searchParams }: Props) {
  const params = await searchParams;
  return <BillingScreen initialStatus={params.status} initialQuery={params.q} openCreate={params.new === "1"} />;
}
