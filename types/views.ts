import type { Appointment, Invoice, Patient, Payment, Prescription, Treatment } from "./index";

/** Appointment enriched with display names for UI tables and the calendar. */
export interface AppointmentView extends Appointment {
  serviceName: string;
  dentistName: string;
}

export interface PatientListItem extends Patient {
  lastVisit: string | null;
  nextAppointment: { date: string; time: string } | null;
  currentTreatment: string | null;
  appointmentCount: number;
  outstanding: number;
}

export interface PatientProfile {
  patient: Patient;
  appointments: AppointmentView[];
  treatments: (Treatment & { dentistName: string })[];
  prescriptions: (Prescription & { dentistName: string })[];
  invoices: Invoice[];
  payments: Payment[];
  summary: {
    totalBilled: number;
    totalPaid: number;
    outstanding: number;
    visits: number;
    lastVisit: string | null;
    nextAppointment: AppointmentView | null;
  };
}

export interface InvoiceView extends Invoice {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  payments: Payment[];
}

export interface TreatmentView extends Treatment {
  patientName: string;
  dentistName: string;
}

export interface PrescriptionView extends Prescription {
  patientName: string;
  patientAge: number | null;
  patientGender: string;
  dentistName: string;
  dentistQualification: string;
}

export interface DashboardData {
  cards: {
    todaysAppointments: number;
    pending: number;
    confirmed: number;
    newPatients: number;
    todaysRevenue: number;
    outstanding: number;
  };
  statusBreakdown: { status: string; label: string; count: number; color: string }[];
  monthlyRevenue: { month: string; revenue: number }[];
  popularServices: { name: string; count: number }[];
  upcoming: AppointmentView[];
  recentPayments: (Payment & { patientName: string })[];
}

export interface ReportsData {
  range: { from: string; to: string };
  totals: {
    revenue: number;
    refunds: number;
    invoiced: number;
    outstanding: number;
    appointments: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
    newPatients: number;
    leads: number;
    convertedLeads: number;
  };
  revenueByMonth: { month: string; revenue: number; invoiced: number }[];
  revenueByService: { name: string; revenue: number; count: number }[];
  revenueByMethod: { method: string; amount: number }[];
  appointmentsByDentist: { name: string; total: number; completed: number }[];
  appointmentsByStatus: { label: string; count: number; color: string }[];
  leadsByStatus: { label: string; count: number }[];
}
