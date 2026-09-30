"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarClock, CalendarDays, CheckCircle2, Hourglass, IndianRupee, UserPlus, Wallet } from "lucide-react";
import { useDashboard } from "@/lib/query";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { HorizontalBars, RevenueChart } from "@/components/admin/charts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppointmentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RenderContent } from "@/components/shared/render-content";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export function DashboardScreen() {
  const query = useDashboard();

  return (
    <>
      <PageHeader
        title="Good day 👋"
        description={`Here's what's happening at the clinic today, ${format(new Date(), "EEEE d MMMM")}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/calendar">
              <CalendarDays />
              Open calendar
            </Link>
          </Button>
        }
      />

      <RenderContent query={query} loading={<DashboardSkeleton />} errorTitle="Couldn't load the dashboard">
        {(data) => (
          <>
            <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Today's appointments" value={data.cards.todaysAppointments} icon={CalendarClock} href="/admin/calendar" hint="Excluding cancellations" />
              <StatCard label="Pending requests" value={data.cards.pending} icon={Hourglass} tone="gray" href="/admin/appointments?status=PENDING" hint="Awaiting confirmation" />
              <StatCard label="Confirmed upcoming" value={data.cards.confirmed} icon={CheckCircle2} tone="blue" href="/admin/appointments?status=CONFIRMED" />
              <StatCard label="New patients" value={data.cards.newPatients} icon={UserPlus} tone="teal" href="/admin/patients" hint="This month" />
              <StatCard label="Today's revenue" value={formatCurrency(data.cards.todaysRevenue)} icon={IndianRupee} tone="green" href="/admin/billing" hint="Net of refunds" />
              <StatCard label="Outstanding" value={formatCurrency(data.cards.outstanding)} icon={Wallet} tone="amber" href="/admin/billing?status=OUTSTANDING" hint="Unpaid & partial invoices" />
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Payments received per month (net of refunds), last 6 months</CardDescription>
                  <CardAction>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/admin/reports">
                        Reports <ArrowRight />
                      </Link>
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={data.monthlyRevenue} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Appointment overview</CardTitle>
                  <CardDescription>All appointments by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <HorizontalBars data={data.statusBreakdown.map((s) => ({ name: s.label, value: s.count, color: s.color }))} />
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <Card className="gap-0 pb-0">
                <CardHeader className="pb-4">
                  <CardTitle>Upcoming appointments</CardTitle>
                  <CardDescription>Next pending and confirmed visits</CardDescription>
                  <CardAction>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/admin/appointments">
                        View all <ArrowRight />
                      </Link>
                    </Button>
                  </CardAction>
                </CardHeader>
                {data.upcoming.length === 0 ? (
                  <EmptyState title="No upcoming appointments" description="New bookings from the website will appear here." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.upcoming.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Link href={`/admin/calendar?date=${a.date}&id=${a.id}`} className="font-medium hover:text-primary">
                              {a.patientName}
                            </Link>
                            <span className="block text-xs text-muted-foreground">{a.dentistName}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{a.serviceName}</TableCell>
                          <TableCell>
                            {formatDate(a.date, "EEE d MMM")}
                            <span className="block text-xs text-muted-foreground">{formatTime(a.time)}</span>
                          </TableCell>
                          <TableCell>
                            <AppointmentStatusBadge status={a.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular services</CardTitle>
                    <CardDescription>Most booked (excluding cancellations)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HorizontalBars data={data.popularServices.map((s) => ({ name: s.name, value: s.count }))} color="var(--chart-2)" />
                  </CardContent>
                </Card>
                <Card className="gap-3">
                  <CardHeader>
                    <CardTitle>Recent payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.recentPayments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                    ) : (
                      <ul className="divide-y">
                        {data.recentPayments.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{p.patientName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(p.date)} · {PAYMENT_METHOD_LABELS[p.method]}
                              </span>
                            </span>
                            <span className={p.type === "REFUND" ? "font-medium text-destructive tabular-nums" : "font-medium tabular-nums"}>
                              {p.type === "REFUND" ? "−" : ""}
                              {formatCurrency(p.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </RenderContent>
    </>
  );
}
