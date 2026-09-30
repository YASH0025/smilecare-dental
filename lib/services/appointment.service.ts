import "server-only";
import { addDays, format } from "date-fns";
import type { Appointment, AppointmentStatus, Dentist, Service } from "@/types";
import type { AppointmentView } from "@/types/views";
import { appointmentRepository, dentistRepository, serviceRepository, settingsRepository } from "@/lib/repositories";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  bookingSchema,
  rescheduleSchema,
  slotQuerySchema,
} from "@/lib/validations";
import { APPOINTMENT_STATUS_META, APPOINTMENT_TRANSITIONS, BLOCKING_STATUSES } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils/format";
import { badRequest, conflict, notFound } from "./errors";
import { computeSlots, isSlotBookable } from "./slots";
import { patientService } from "./patient.service";
import { notificationService } from "./notification.service";

/** Allowed status transitions — keeps the workflow honest. */
const TRANSITIONS = APPOINTMENT_TRANSITIONS;

export function allowedTransitions(status: AppointmentStatus) {
  return TRANSITIONS[status];
}

export interface AppointmentFilters {
  from?: string;
  to?: string;
  dentistId?: string;
  serviceId?: string;
  status?: string;
  patientId?: string;
  q?: string;
}

async function lookups() {
  const [services, dentists] = await Promise.all([serviceRepository.getAll(), dentistRepository.getAll()]);
  return {
    services: new Map(services.map((s) => [s.id, s])),
    dentists: new Map(dentists.map((d) => [d.id, d])),
  };
}

function toView(a: Appointment, maps: { services: Map<string, Service>; dentists: Map<string, Dentist> }): AppointmentView {
  return {
    ...a,
    serviceName: maps.services.get(a.serviceId)?.name ?? "Unknown service",
    dentistName: maps.dentists.get(a.dentistId)?.name ?? "Unassigned",
  };
}

const sortChrono = (a: Appointment, b: Appointment) => (a.date + a.time).localeCompare(b.date + b.time);

async function assertBookable(params: {
  dentistId: string;
  serviceId: string;
  date: string;
  time: string;
  excludeId?: string;
  enforceWindow: boolean;
  existing: Appointment[];
}) {
  const [dentist, service, settings] = await Promise.all([
    dentistRepository.getById(params.dentistId),
    serviceRepository.getById(params.serviceId),
    settingsRepository.get(),
  ]);
  if (!dentist || !dentist.active) throw notFound("Dentist");
  if (!service) throw notFound("Service");
  if (!dentist.serviceIds.includes(service.id)) {
    throw badRequest(`${dentist.name} does not provide ${service.name}`, "DENTIST_SERVICE_MISMATCH");
  }

  const today = format(new Date(), "yyyy-MM-dd");
  if (params.enforceWindow) {
    if (params.date < today) throw badRequest("Please choose a date in the future", "INVALID_DATE");
    const last = format(addDays(new Date(), settings.bookingWindowDays), "yyyy-MM-dd");
    if (params.date > last) throw badRequest(`Bookings open up to ${settings.bookingWindowDays} days in advance`, "INVALID_DATE");
  }

  const bookable = isSlotBookable({
    dentist,
    date: params.date,
    time: params.time,
    duration: service.duration,
    interval: settings.slotInterval,
    appointments: params.existing,
    excludeId: params.excludeId,
    // Admin actions may record past-dated visits; public bookings may not.
    now: params.enforceWindow ? new Date() : new Date(0),
  });
  if (!bookable) {
    throw conflict(
      `${formatTime(params.time)} on ${formatDate(params.date)} is no longer available with ${dentist.name}. Please pick another slot.`,
      "SLOT_UNAVAILABLE",
    );
  }
  return { dentist, service };
}

export const appointmentService = {
  async list(filters: AppointmentFilters = {}): Promise<AppointmentView[]> {
    const [all, maps] = await Promise.all([appointmentRepository.getAll(), lookups()]);
    const q = filters.q?.trim().toLowerCase();
    const statuses = filters.status ? filters.status.split(",") : null;
    return all
      .filter((a) => (!filters.from || a.date >= filters.from) && (!filters.to || a.date <= filters.to))
      .filter((a) => !filters.dentistId || a.dentistId === filters.dentistId)
      .filter((a) => !filters.serviceId || a.serviceId === filters.serviceId)
      .filter((a) => !filters.patientId || a.patientId === filters.patientId)
      .filter((a) => !statuses || statuses.includes(a.status))
      .filter(
        (a) =>
          !q ||
          a.patientName.toLowerCase().includes(q) ||
          a.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
          a.id.toLowerCase().includes(q),
      )
      .sort(sortChrono)
      .map((a) => toView(a, maps));
  },

  async get(id: string) {
    const [a, maps] = await Promise.all([appointmentRepository.getById(id), lookups()]);
    if (!a) throw notFound("Appointment");
    return toView(a, maps);
  },

  /** Public + admin slot lookup. */
  async getSlots(query: unknown) {
    const { dentistId, date, serviceId, excludeId } = slotQuerySchema.parse(query);
    const [dentist, settings, appointments, service] = await Promise.all([
      dentistRepository.getById(dentistId),
      settingsRepository.get(),
      appointmentRepository.findMany((a) => a.dentistId === dentistId && a.date === date),
      serviceId ? serviceRepository.getById(serviceId) : Promise.resolve(null),
    ]);
    if (!dentist) throw notFound("Dentist");
    const excluded = excludeId ? await appointmentRepository.getById(excludeId) : null;
    const duration = service?.duration ?? excluded?.duration ?? settings.slotInterval;
    return {
      date,
      dentistId,
      duration,
      ...computeSlots({ dentist, date, duration, interval: settings.slotInterval, appointments, excludeId }),
    };
  },

  /** Public website booking → always PENDING. */
  async book(input: unknown) {
    const data = bookingSchema.parse(input);
    // Pre-check before touching patient records so a rejected booking leaves no trace.
    await assertBookable({ ...data, enforceWindow: true, existing: await appointmentRepository.getAll() });
    const patient = await patientService.findOrCreate({
      name: data.fullName,
      phone: data.phone,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
    });

    const created = await appointmentRepository.transaction(async (items) => {
      // Duplicate guard: same patient already holds an active booking at that exact time.
      const duplicate = items.find(
        (a) => a.patientId === patient.id && a.date === data.date && a.time === data.time && BLOCKING_STATUSES.includes(a.status),
      );
      if (duplicate) throw conflict("You already have an appointment at this time.", "DUPLICATE_APPOINTMENT");

      const { service } = await assertBookable({ ...data, enforceWindow: true, existing: items });
      const now = new Date().toISOString();
      const nextNum = items.reduce((m, a) => Math.max(m, Number(a.id.replace("APT-", "")) || 0), 1000) + 1;
      const appointment: Appointment = {
        id: `APT-${nextNum}`,
        patientId: patient.id,
        patientName: patient.name,
        phone: data.phone,
        email: data.email,
        serviceId: data.serviceId,
        dentistId: data.dentistId,
        date: data.date,
        time: data.time,
        duration: service.duration,
        status: "PENDING",
        reason: data.reason,
        notes: data.notes,
        source: "ONLINE",
        history: [{ at: now, status: "PENDING", note: "Booked online" }],
        createdAt: now,
        updatedAt: now,
      };
      return { items: [...items, appointment], result: appointment };
    });

    await notificationService.notify(
      "APPOINTMENT_REQUESTED",
      "New appointment request",
      `${created.patientName} requested ${formatDate(created.date)} at ${formatTime(created.time)}.`,
      `/admin/calendar?date=${created.date}&id=${created.id}`,
    );
    return this.get(created.id);
  },

  /** Admin-created appointment (phone / walk-in). */
  async create(input: unknown) {
    const data = appointmentCreateSchema.parse(input);
    await assertBookable({ ...data, enforceWindow: false, existing: await appointmentRepository.getAll() });
    const patient = data.patientId
      ? await patientService.get(data.patientId)
      : await patientService.findOrCreate({
          name: data.patientName,
          phone: data.phone,
          email: data.email ?? "",
          dateOfBirth: data.dateOfBirth || undefined,
        });

    const status: AppointmentStatus = data.status ?? "CONFIRMED";
    const created = await appointmentRepository.transaction(async (items) => {
      const { service } = await assertBookable({ ...data, enforceWindow: false, existing: items });
      const now = new Date().toISOString();
      const nextNum = items.reduce((m, a) => Math.max(m, Number(a.id.replace("APT-", "")) || 0), 1000) + 1;
      const appointment: Appointment = {
        id: `APT-${nextNum}`,
        patientId: patient.id,
        patientName: patient.name,
        phone: data.phone || patient.phone,
        email: data.email || patient.email,
        serviceId: data.serviceId,
        dentistId: data.dentistId,
        date: data.date,
        time: data.time,
        duration: service.duration,
        status,
        reason: data.reason,
        notes: data.notes,
        source: data.source ?? "ADMIN",
        history: [{ at: now, status, note: "Created by clinic staff" }],
        createdAt: now,
        updatedAt: now,
      };
      return { items: [...items, appointment], result: appointment };
    });
    return this.get(created.id);
  },

  async update(id: string, input: unknown) {
    const data = appointmentUpdateSchema.parse(input);
    const updated = await appointmentRepository.transaction(async (items) => {
      const index = items.findIndex((a) => a.id === id);
      if (index === -1) throw notFound("Appointment");
      const current = items[index];
      const now = new Date().toISOString();
      const next: Appointment = { ...current, updatedAt: now };
      const history = [...current.history];

      const moving =
        (data.date && data.date !== current.date) ||
        (data.time && data.time !== current.time) ||
        (data.dentistId && data.dentistId !== current.dentistId) ||
        (data.serviceId && data.serviceId !== current.serviceId);

      if (data.status && data.status !== current.status) {
        if (!TRANSITIONS[current.status].includes(data.status)) {
          throw badRequest(
            `Cannot change an appointment from ${APPOINTMENT_STATUS_META[current.status].label} to ${APPOINTMENT_STATUS_META[data.status].label}`,
            "INVALID_TRANSITION",
          );
        }
        next.status = data.status;
        history.push({ at: now, status: data.status, note: data.note });
      }

      if (data.reason !== undefined) next.reason = data.reason;
      if (data.notes !== undefined) next.notes = data.notes;

      const reopening = current.status === "CANCELLED" && next.status === "PENDING";
      if (moving || reopening) {
        next.date = data.date ?? current.date;
        next.time = data.time ?? current.time;
        next.dentistId = data.dentistId ?? current.dentistId;
        next.serviceId = data.serviceId ?? current.serviceId;
        const { service } = await assertBookable({
          dentistId: next.dentistId,
          serviceId: next.serviceId,
          date: next.date,
          time: next.time,
          excludeId: id,
          enforceWindow: false,
          existing: items,
        });
        next.duration = service.duration;
        if (moving && !data.status) {
          if (!TRANSITIONS[current.status].includes("RESCHEDULED")) {
            throw badRequest(`A ${APPOINTMENT_STATUS_META[current.status].label.toLowerCase()} appointment cannot be rescheduled`, "INVALID_TRANSITION");
          }
          next.status = "RESCHEDULED";
          history.push({
            at: now,
            status: "RESCHEDULED",
            note: data.note || `Moved from ${formatDate(current.date)} ${formatTime(current.time)}`,
          });
        }
      }

      next.history = history;
      const copy = [...items];
      copy[index] = next;
      return { items: copy, result: { before: current, after: next } };
    });

    const { before, after } = updated;
    if (before.status !== after.status) {
      if (after.status === "CONFIRMED") {
        await notificationService.notify(
          "APPOINTMENT_CONFIRMED",
          "Appointment confirmed",
          `${after.patientName} · ${formatDate(after.date)} at ${formatTime(after.time)}`,
          `/admin/calendar?date=${after.date}&id=${after.id}`,
        );
      } else if (after.status === "CANCELLED") {
        await notificationService.notify(
          "APPOINTMENT_CANCELLED",
          "Appointment cancelled",
          `${after.patientName}'s ${formatDate(after.date)} appointment was cancelled.`,
          `/admin/appointments?q=${after.id}`,
        );
      }
    }
    return this.get(id);
  },

  async reschedule(id: string, input: unknown) {
    const data = rescheduleSchema.parse(input);
    return this.update(id, { date: data.date, time: data.time, note: data.note });
  },

  async delete(id: string) {
    if (!(await appointmentRepository.delete(id))) throw notFound("Appointment");
    return { id };
  },
};
