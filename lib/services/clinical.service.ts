import "server-only";
import type { TreatmentView, PrescriptionView } from "@/types/views";
import { dentistRepository, patientRepository, prescriptionRepository, treatmentRepository } from "@/lib/repositories";
import { prescriptionSchema, prescriptionUpdateSchema, treatmentSchema, treatmentUpdateSchema } from "@/lib/validations";
import { ageFrom } from "@/lib/utils/time";
import { notFound } from "./errors";

async function names() {
  const [patients, dentists] = await Promise.all([patientRepository.getAll(), dentistRepository.getAll()]);
  return {
    patients: new Map(patients.map((p) => [p.id, p])),
    dentists: new Map(dentists.map((d) => [d.id, d])),
  };
}

async function assertRefs(patientId?: string, dentistId?: string) {
  if (patientId && !(await patientRepository.getById(patientId))) throw notFound("Patient");
  if (dentistId && !(await dentistRepository.getById(dentistId))) throw notFound("Dentist");
}

export const treatmentService = {
  async list(filters: { patientId?: string; status?: string; q?: string } = {}): Promise<TreatmentView[]> {
    const [all, maps] = await Promise.all([treatmentRepository.getAll(), names()]);
    const q = filters.q?.toLowerCase().trim();
    return all
      .filter((t) => !filters.patientId || t.patientId === filters.patientId)
      .filter((t) => !filters.status || filters.status === "ALL" || t.status === filters.status)
      .map((t) => ({
        ...t,
        patientName: maps.patients.get(t.patientId)?.name ?? "Unknown patient",
        dentistName: maps.dentists.get(t.dentistId)?.name ?? "—",
      }))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.patientName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  async get(id: string) {
    const t = await treatmentRepository.getById(id);
    if (!t) throw notFound("Treatment");
    return t;
  },

  async create(input: unknown) {
    const data = treatmentSchema.parse(input);
    await assertRefs(data.patientId, data.dentistId);
    return treatmentRepository.create({
      ...data,
      endDate: data.endDate || undefined,
      followUpDate: data.followUpDate || undefined,
    });
  },

  async update(id: string, input: unknown) {
    const data = treatmentUpdateSchema.parse(input);
    await assertRefs(data.patientId, data.dentistId);
    const patch = { ...data };
    if (patch.endDate === "") patch.endDate = undefined;
    if (patch.followUpDate === "") patch.followUpDate = undefined;
    // Auto-progress status from the checklist when the caller didn't set it.
    if (data.steps && !data.status) {
      const current = await this.get(id);
      if (current.status !== "CANCELLED") {
        const done = data.steps.filter((s) => s.done).length;
        patch.status = done === 0 ? "PLANNED" : done === data.steps.length ? "COMPLETED" : "IN_PROGRESS";
      }
    }
    const updated = await treatmentRepository.update(id, patch);
    if (!updated) throw notFound("Treatment");
    return updated;
  },

  async delete(id: string) {
    if (!(await treatmentRepository.delete(id))) throw notFound("Treatment");
    return { id };
  },
};

export const prescriptionService = {
  async list(filters: { patientId?: string; q?: string } = {}): Promise<PrescriptionView[]> {
    const [all, maps] = await Promise.all([prescriptionRepository.getAll(), names()]);
    const q = filters.q?.toLowerCase().trim();
    return all
      .filter((r) => !filters.patientId || r.patientId === filters.patientId)
      .map((r) => {
        const p = maps.patients.get(r.patientId);
        const d = maps.dentists.get(r.dentistId);
        return {
          ...r,
          patientName: p?.name ?? "Unknown patient",
          patientAge: ageFrom(p?.dateOfBirth),
          patientGender: p?.gender ?? "",
          dentistName: d?.name ?? "—",
          dentistQualification: d?.qualification ?? "",
        };
      })
      .filter(
        (r) =>
          !q ||
          r.patientName.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.medicines.some((m) => m.name.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  },

  async get(id: string): Promise<PrescriptionView> {
    const found = (await this.list()).find((r) => r.id === id);
    if (!found) throw notFound("Prescription");
    return found;
  },

  async create(input: unknown) {
    const data = prescriptionSchema.parse(input);
    await assertRefs(data.patientId, data.dentistId);
    return prescriptionRepository.create(data);
  },

  async update(id: string, input: unknown) {
    const data = prescriptionUpdateSchema.parse(input);
    await assertRefs(data.patientId, data.dentistId);
    const updated = await prescriptionRepository.update(id, data);
    if (!updated) throw notFound("Prescription");
    return updated;
  },

  async delete(id: string) {
    if (!(await prescriptionRepository.delete(id))) throw notFound("Prescription");
    return { id };
  },
};
