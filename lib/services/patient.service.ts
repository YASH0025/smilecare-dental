import "server-only";
import { format } from "date-fns";
import type { Patient, ToothRecord } from "@/types";
import type { PatientListItem, PatientProfile } from "@/types/views";
import {
  appointmentRepository,
  dentistRepository,
  invoiceRepository,
  patientRepository,
  paymentRepository,
  prescriptionRepository,
  serviceRepository,
  treatmentRepository,
} from "@/lib/repositories";
import { newId } from "@/lib/json-db/repository";
import {
  patientDocumentSchema,
  patientNoteSchema,
  patientSchema,
  patientUpdateSchema,
  toothUpdateSchema,
} from "@/lib/validations";
import { conflict, notFound } from "./errors";
import { notificationService } from "./notification.service";

const normalisePhone = (phone: string) => phone.replace(/\D/g, "").slice(-10);

const ACTIVE = ["PENDING", "CONFIRMED", "RESCHEDULED"];

export const patientService = {
  async list(filters: { q?: string; status?: string } = {}): Promise<PatientListItem[]> {
    const [patients, appointments, treatments, invoices] = await Promise.all([
      patientRepository.getAll(),
      appointmentRepository.getAll(),
      treatmentRepository.getAll(),
      invoiceRepository.getAll(),
    ]);
    const today = format(new Date(), "yyyy-MM-dd");
    const q = filters.q?.trim().toLowerCase();

    return patients
      .filter((p) => !filters.status || filters.status === "ALL" || p.status === filters.status)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          normalisePhone(p.phone).includes(q.replace(/\D/g, "") || "¤"),
      )
      .map((p) => {
        const own = appointments.filter((a) => a.patientId === p.id);
        const past = own.filter((a) => a.status === "COMPLETED").sort((a, b) => b.date.localeCompare(a.date));
        const upcoming = own
          .filter((a) => a.date >= today && ACTIVE.includes(a.status))
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        const active = treatments.find((t) => t.patientId === p.id && (t.status === "IN_PROGRESS" || t.status === "PLANNED"));
        const outstanding = invoices
          .filter((i) => i.patientId === p.id && i.status !== "CANCELLED" && i.status !== "DRAFT")
          .reduce((sum, i) => sum + i.balance, 0);
        return {
          ...p,
          lastVisit: past[0]?.date ?? null,
          nextAppointment: upcoming[0] ? { date: upcoming[0].date, time: upcoming[0].time } : null,
          currentTreatment: active?.title ?? null,
          appointmentCount: own.length,
          outstanding,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async get(id: string) {
    const p = await patientRepository.getById(id);
    if (!p) throw notFound("Patient");
    return p;
  },

  async profile(id: string): Promise<PatientProfile> {
    const patient = await this.get(id);
    const [appointments, treatments, prescriptions, invoices, payments, services, dentists] = await Promise.all([
      appointmentRepository.findMany((a) => a.patientId === id),
      treatmentRepository.findMany((t) => t.patientId === id),
      prescriptionRepository.findMany((r) => r.patientId === id),
      invoiceRepository.findMany((i) => i.patientId === id),
      paymentRepository.findMany((p) => p.patientId === id),
      serviceRepository.getAll(),
      dentistRepository.getAll(),
    ]);
    const svc = new Map(services.map((s) => [s.id, s.name]));
    const doc = new Map(dentists.map((d) => [d.id, d.name]));
    const today = format(new Date(), "yyyy-MM-dd");

    const appts = appointments
      .map((a) => ({ ...a, serviceName: svc.get(a.serviceId) ?? "—", dentistName: doc.get(a.dentistId) ?? "—" }))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const billable = invoices.filter((i) => i.status !== "CANCELLED" && i.status !== "DRAFT");
    const next = [...appts]
      .filter((a) => a.date >= today && ACTIVE.includes(a.status))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

    return {
      patient,
      appointments: appts,
      treatments: treatments
        .map((t) => ({ ...t, dentistName: doc.get(t.dentistId) ?? "—" }))
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
      prescriptions: prescriptions
        .map((r) => ({ ...r, dentistName: doc.get(r.dentistId) ?? "—" }))
        .sort((a, b) => b.date.localeCompare(a.date)),
      invoices: invoices.sort((a, b) => b.date.localeCompare(a.date)),
      payments: payments.sort((a, b) => b.date.localeCompare(a.date)),
      summary: {
        totalBilled: billable.reduce((s, i) => s + i.total, 0),
        totalPaid: billable.reduce((s, i) => s + i.paid - i.refunded, 0),
        outstanding: billable.reduce((s, i) => s + i.balance, 0),
        visits: appointments.filter((a) => a.status === "COMPLETED").length,
        lastVisit: appts.find((a) => a.status === "COMPLETED")?.date ?? null,
        nextAppointment: next ?? null,
      },
    };
  },

  async create(input: unknown) {
    const data = patientSchema.parse(input);
    const phone = normalisePhone(data.phone);
    if (await patientRepository.findOne((p) => normalisePhone(p.phone) === phone)) {
      throw conflict("A patient with this phone number already exists", "DUPLICATE_PATIENT");
    }
    const patient = await patientRepository.create({ ...data, dentalChart: {}, notes: [], documents: [] });
    await notificationService.notify("NEW_PATIENT", "New patient registered", `${patient.name} (${patient.id})`, `/admin/patients/${patient.id}`);
    return patient;
  },

  /** Used by bookings: match on phone, otherwise register a new patient. */
  async findOrCreate(input: { name: string; phone: string; email: string; dateOfBirth?: string }): Promise<Patient> {
    const phone = normalisePhone(input.phone);
    const existing = await patientRepository.findOne((p) => normalisePhone(p.phone) === phone);
    if (existing) {
      const patch: Partial<Patient> = {};
      if (!existing.email && input.email) patch.email = input.email;
      if (!existing.dateOfBirth && input.dateOfBirth) patch.dateOfBirth = input.dateOfBirth;
      return Object.keys(patch).length ? ((await patientRepository.update(existing.id, patch)) ?? existing) : existing;
    }
    const patient = await patientRepository.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      dateOfBirth: input.dateOfBirth ?? "",
      gender: "OTHER",
      address: "",
      bloodGroup: "",
      allergies: "",
      medicalHistory: "",
      dentalHistory: "",
      emergencyContact: "",
      status: "ACTIVE",
      dentalChart: {},
      notes: [],
      documents: [],
    });
    await notificationService.notify("NEW_PATIENT", "New patient registered", `${patient.name} (${patient.id}) via online booking`, `/admin/patients/${patient.id}`);
    return patient;
  },

  async update(id: string, input: unknown) {
    const data = patientUpdateSchema.parse(input);
    if (data.phone) {
      const phone = normalisePhone(data.phone);
      if (await patientRepository.findOne((p) => p.id !== id && normalisePhone(p.phone) === phone)) {
        throw conflict("Another patient already uses this phone number", "DUPLICATE_PATIENT");
      }
    }
    const updated = await patientRepository.update(id, data);
    if (!updated) throw notFound("Patient");
    // Keep denormalised names on appointments in sync.
    if (data.name || data.phone) {
      await appointmentRepository.transaction((items) => ({
        items: items.map((a) =>
          a.patientId === id ? { ...a, patientName: updated.name, phone: updated.phone, email: updated.email || a.email } : a,
        ),
        result: true,
      }));
    }
    return updated;
  },

  async delete(id: string) {
    const [appt, invoice] = await Promise.all([
      appointmentRepository.findOne((a) => a.patientId === id),
      invoiceRepository.findOne((i) => i.patientId === id),
    ]);
    if (appt || invoice) {
      throw conflict("This patient has appointments or invoices on record. Mark the patient inactive instead.", "HAS_RECORDS");
    }
    if (!(await patientRepository.delete(id))) throw notFound("Patient");
    return { id };
  },

  async updateTeeth(id: string, input: unknown) {
    const data = toothUpdateSchema.parse(input);
    const patient = await this.get(id);
    const now = new Date().toISOString();
    const chart = { ...patient.dentalChart };
    for (const tooth of data.teeth) {
      if (data.condition === "HEALTHY" && !data.notes) delete chart[tooth];
      else chart[tooth] = { condition: data.condition, notes: data.notes, updatedAt: now } satisfies ToothRecord;
    }
    return (await patientRepository.update(id, { dentalChart: chart }))!;
  },

  async addNote(id: string, input: unknown, author: string) {
    const { text } = patientNoteSchema.parse(input);
    const patient = await this.get(id);
    const note = { id: newId(), text, author, createdAt: new Date().toISOString() };
    await patientRepository.update(id, { notes: [note, ...patient.notes] });
    return note;
  },

  async deleteNote(id: string, noteId: string) {
    const patient = await this.get(id);
    await patientRepository.update(id, { notes: patient.notes.filter((n) => n.id !== noteId) });
    return { id: noteId };
  },

  async addDocument(id: string, input: unknown) {
    const data = patientDocumentSchema.parse(input);
    const patient = await this.get(id);
    const doc = { id: newId(), ...data };
    await patientRepository.update(id, { documents: [doc, ...patient.documents] });
    return doc;
  },

  async deleteDocument(id: string, docId: string) {
    const patient = await this.get(id);
    await patientRepository.update(id, { documents: patient.documents.filter((d) => d.id !== docId) });
    return { id: docId };
  },
};
