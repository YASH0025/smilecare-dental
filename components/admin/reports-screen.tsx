"use client";

import { useReports } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { ChartSkeleton, StatCardsSkeleton } from "@/components/shared/skeletons";
import type { ReportsData } from "@/types/views";
import { PageHeader } from "@/components/admin/page-header";
import { ReportsFilters, ExportCsvButton } from "@/components/admin/reports-controls";
import { HorizontalBars, RevenueChart } from "@/components/admin/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Reports with a URL-driven date range; the previous report stays visible while a new range loads. */
export function ReportsScreen({ from, to }: { from?: string; to?: string }) {
  const query = useReports({ from, to });
  return (
    <RenderContent
      query={query}
      showRefreshing
      errorTitle="Couldn't load reports"
      loading={
        <div className="space-y-6">
          <PageHeader title="Reports" description="Crunching the numbers…" className="mb-0" />
          <StatCardsSkeleton />
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      }
    >
      {(r) => <ReportsBody r={r} />}
    </RenderContent>
  );
}

function ReportsBody({ r }: { r: ReportsData }) {
  const t = r.totals;

  const kpis = [
    { label: "Revenue collected", value: formatCurrency(t.revenue), hint: `Refunds ${formatCurrency(t.refunds)}` },
    { label: "Invoiced", value: formatCurrency(t.invoiced), hint: `Outstanding ${formatCurrency(t.outstanding)}` },
    { label: "Appointments", value: t.appointments, hint: `${t.completed} completed · ${t.cancelled} cancelled` },
    { label: "Show-up rate", value: `${t.completionRate}%`, hint: `${t.noShow} no-shows` },
    { label: "New patients", value: t.newPatients, hint: "Registered in period" },
    { label: "Lead conversion", value: t.leads ? `${Math.round((t.convertedLeads / t.leads) * 100)}%` : "—", hint: `${t.convertedLeads} of ${t.leads} leads` },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${formatDate(r.range.from)} – ${formatDate(r.range.to)}`}
        actions={
          <ExportCsvButton
            filename={`smilecare-report-${r.range.from}-to-${r.range.to}.csv`}
            rows={[
              ["Section", "Label", "Value"],
              ...kpis.map((k) => ["Summary", k.label, String(k.value)]),
              ...r.revenueByMonth.map((m) => ["Revenue by month", m.month, String(m.revenue)]),
              ...r.revenueByService.map((s) => ["Revenue by service", s.name, String(s.revenue)]),
              ...r.revenueByMethod.map((m) => ["Revenue by method", m.method, String(m.amount)]),
              ...r.appointmentsByDentist.map((d) => ["Appointments by dentist", d.name, `${d.total} (${d.completed} completed)`]),
            ]}
          />
        }
      />
      <ReportsFilters from={r.range.from} to={r.range.to} />

      <section aria-label="Summary" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[13px] font-medium text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by month</CardTitle>
            <CardDescription>Payments received, net of refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={r.revenueByMonth.map((m) => ({ month: m.month, revenue: m.revenue }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>Share of collected revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {r.revenueByMethod.length ? (
              <ul className="space-y-3">
                {[...r.revenueByMethod]
                  .sort((a, b) => b.amount - a.amount)
                  .map((m) => {
                    const pct = t.revenue ? Math.round((m.amount / t.revenue) * 100) : 0;
                    return (
                      <li key={m.method}>
                        <div className="flex justify-between text-sm">
                          <span>{m.method}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatCurrency(m.amount)} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No payments in this period.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by service</CardTitle>
            <CardDescription>Collected revenue attributed via invoice line items</CardDescription>
          </CardHeader>
          <CardContent>
            {r.revenueByService.length ? (
              <HorizontalBars data={r.revenueByService.map((s) => ({ name: s.name, value: s.revenue }))} color="var(--chart-2)" valueFormat="currency" />
            ) : (
              <p className="text-sm text-muted-foreground">No revenue in this period.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments by status</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars data={r.appointmentsByStatus.map((s) => ({ name: s.label, value: s.count, color: s.color }))} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <CardTitle>Dentist productivity</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dentist</TableHead>
                <TableHead className="text-right">Appointments</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {r.appointmentsByDentist.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.total}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.completed}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.total ? Math.round((d.completed / d.total) * 100) : 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead pipeline</CardTitle>
            <CardDescription>Leads received in the period, by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBars data={r.leadsByStatus.map((l) => ({ name: l.label, value: l.count }))} color="var(--chart-3)" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
