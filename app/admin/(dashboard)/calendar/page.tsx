import type { Metadata } from "next";
import { CalendarView } from "@/components/calendar/calendar-view";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Calendar" };

type Props = { searchParams: Promise<{ date?: string; id?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const { date, id } = await searchParams;
  return (
    <>
      <PageHeader title="Appointment calendar" description="Click an appointment to confirm, reschedule, cancel or complete it. Click an empty slot to book." />
      <CalendarView initialDate={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined} focusId={id} />
    </>
  );
}
