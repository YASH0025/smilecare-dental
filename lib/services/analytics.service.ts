import "server-only";
import { format, startOfMonth, subMonths, parseISO } from "date-fns";
import type { DashboardData, ReportsData } from "@/types/views";
import {
  appointmentRepository,
  dentistRepository,
  invoiceRepository,
  leadRepository,
  patientRepository,
  paymentRepository,
  serviceRepository,
} from "@/lib/repositories";
import { APPOINTMENT_STATUS_META, LEAD_STATUS_META, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { APPOINTMENT_STATUSES, LEAD_STATUSES } from "@/types";

const monthKey = (date: string) => date.slice(0, 7);

function lastMonths(n: number) {
  const months: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = startOfMonth(subMonths(new Date(), i));
    months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM") });
  }
  return months;
}

export const analyticsService = {
  async dashboard(): Promise<DashboardData> {
    const [appointments, patients, invoices, payments, services, dentists] = await Promise.all([
      appointmentRepository.getAll(),
      patientRepository.getAll(),
      invoiceRepository.getAll(),
      paymentRepository.getAll(),
      serviceRepository.getAll(),
      dentistRepository.getAll(),
    ]);
    const today = format(new Date(), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const svc = new Map(services.map((s) => [s.id, s.name]));
    const doc = new Map(dentists.map((d) => [d.id, d.name]));
    const pmap = new Map(patients.map((p) => [p.id, p.name]));

    const net = (date?: (d: string) => boolean) =>
      payments.filter((p) => !date || date(p.date)).reduce((s, p) => s + (p.type === "PAYMENT" ? p.amount : -p.amount), 0);

    const months = lastMonths(6);
    const popular = new Map<string, number>();
    appointments
      .filter((a) => a.status !== "CANCELLED")
      .forEach((a) => popular.set(a.serviceId, (popular.get(a.serviceId) ?? 0) + 1));

    return {
      cards: {
        todaysAppointments: appointments.filter((a) => a.date === today && a.status !== "CANCELLED").length,
        pending: appointments.filter((a) => a.status === "PENDING" && a.date >= today).length,
        confirmed: appointments.filter((a) => ["CONFIRMED", "RESCHEDULED"].includes(a.status) && a.date >= today).length,
        newPatients: patients.filter((p) => p.createdAt.slice(0, 10) >= monthStart).length,
        todaysRevenue: net((d) => d === today),
        outstanding: invoices.filter((i) => ["UNPAID", "PARTIAL"].includes(i.status)).reduce((s, i) => s + i.balance, 0),
      },
      statusBreakdown: (["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"] as const).map((status) => ({
        status,
        label: APPOINTMENT_STATUS_META[status].label,
        color: APPOINTMENT_STATUS_META[status].calendar,
        count: appointments.filter((a) => a.status === status).length,
      })),
      monthlyRevenue: months.map((m) => ({ month: m.label, revenue: net((d) => monthKey(d) === m.key) })),
      popularServices: [...popular.entries()]
        .map(([id, count]) => ({ name: svc.get(id) ?? "Other", count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      upcoming: appointments
        .filter((a) => a.date >= today && ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(a.status))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 8)
        .map((a) => ({ ...a, serviceName: svc.get(a.serviceId) ?? "—", dentistName: doc.get(a.dentistId) ?? "—" })),
      recentPayments: payments
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .slice(0, 5)
        .map((p) => ({ ...p, patientName: pmap.get(p.patientId) ?? "—" })),
    };
  },

  async reports(range: { from?: string; to?: string } = {}): Promise<ReportsData> {
    const to = range.to ?? format(new Date(), "yyyy-MM-dd");
    const from = range.from ?? format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd");
    const inRange = (d: string) => d >= from && d <= to;

    const [appointments, patients, invoices, payments, services, dentists, leads] = await Promise.all([
      appointmentRepository.getAll(),
      patientRepository.getAll(),
      invoiceRepository.getAll(),
      paymentRepository.getAll(),
      serviceRepository.getAll(),
      dentistRepository.getAll(),
      leadRepository.getAll(),
    ]);

    const appts = appointments.filter((a) => inRange(a.date));
    const pays = payments.filter((p) => inRange(p.date));
    const invs = invoices.filter((i) => inRange(i.date) && i.status !== "CANCELLED" && i.status !== "DRAFT");
    const lds = leads.filter((l) => inRange(l.createdAt.slice(0, 10)));

    const revenue = pays.filter((p) => p.type === "PAYMENT").reduce((s, p) => s + p.amount, 0);
    const refunds = pays.filter((p) => p.type === "REFUND").reduce((s, p) => s + p.amount, 0);
    const completed = appts.filter((a) => a.status === "COMPLETED").length;
    const cancelled = appts.filter((a) => a.status === "CANCELLED").length;
    const noShow = appts.filter((a) => a.status === "NO_SHOW").length;
    const concluded = completed + noShow;

    // Months spanning the range
    const months: { key: string; label: string }[] = [];
    let cursor = startOfMonth(parseISO(from));
    const end = parseISO(to);
    while (cursor <= end && months.length < 24) {
      months.push({ key: format(cursor, "yyyy-MM"), label: format(cursor, "MMM yy") });
      cursor = startOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    }

    // Revenue by service, attributed through invoice line items
    const invoiceById = new Map(invoices.map((i) => [i.id, i]));
    const svcRevenue = new Map<string, { revenue: number; count: number }>();
    const svcName = new Map(services.map((s) => [s.id, s.name]));
    for (const p of pays) {
      const inv = invoiceById.get(p.invoiceId);
      if (!inv) continue;
      const lineTotal = inv.items.reduce((s, i) => s + i.quantity * i.price - i.discount, 0) || 1;
      for (const item of inv.items) {
        const key = item.serviceId ? (svcName.get(item.serviceId) ?? item.description) : item.description;
        const share = ((item.quantity * item.price - item.discount) / lineTotal) * (p.type === "PAYMENT" ? p.amount : -p.amount);
        const cur = svcRevenue.get(key) ?? { revenue: 0, count: 0 };
        svcRevenue.set(key, { revenue: cur.revenue + share, count: cur.count + (p.type === "PAYMENT" ? 1 : 0) });
      }
    }

    const methods = new Map<string, number>();
    pays
      .filter((p) => p.type === "PAYMENT")
      .forEach((p) => methods.set(p.method, (methods.get(p.method) ?? 0) + p.amount));

    return {
      range: { from, to },
      totals: {
        revenue,
        refunds,
        invoiced: invs.reduce((s, i) => s + i.total, 0),
        outstanding: invs.reduce((s, i) => s + i.balance, 0),
        appointments: appts.length,
        completed,
        cancelled,
        noShow,
        completionRate: concluded ? Math.round((completed / concluded) * 100) : 0,
        newPatients: patients.filter((p) => inRange(p.createdAt.slice(0, 10))).length,
        leads: lds.length,
        convertedLeads: lds.filter((l) => l.status === "CONVERTED").length,
      },
      revenueByMonth: months.map((m) => ({
        month: m.label,
        revenue: pays.filter((p) => monthKey(p.date) === m.key).reduce((s, p) => s + (p.type === "PAYMENT" ? p.amount : -p.amount), 0),
        invoiced: invs.filter((i) => monthKey(i.date) === m.key).reduce((s, i) => s + i.total, 0),
      })),
      revenueByService: [...svcRevenue.entries()]
        .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), count: v.count }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      revenueByMethod: [...methods.entries()].map(([method, amount]) => ({
        method: PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ?? method,
        amount,
      })),
      appointmentsByDentist: dentists.map((d) => ({
        name: d.name,
        total: appts.filter((a) => a.dentistId === d.id).length,
        completed: appts.filter((a) => a.dentistId === d.id && a.status === "COMPLETED").length,
      })),
      appointmentsByStatus: APPOINTMENT_STATUSES.map((s) => ({
        label: APPOINTMENT_STATUS_META[s].label,
        color: APPOINTMENT_STATUS_META[s].calendar,
        count: appts.filter((a) => a.status === s).length,
      })),
      leadsByStatus: LEAD_STATUSES.map((s) => ({ label: LEAD_STATUS_META[s].label, count: lds.filter((l) => l.status === s).length })),
    };
  },
};
