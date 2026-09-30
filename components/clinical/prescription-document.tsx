import type { ClinicSettings } from "@/types";
import type { PrescriptionView } from "@/types/views";
import { LogoMark } from "@/components/shared/logo";
import { formatDate } from "@/lib/utils";

/** Printable prescription (used by the view dialog and the print page). */
export function PrescriptionDocument({ rx, clinic }: { rx: PrescriptionView; clinic: Pick<ClinicSettings, "name" | "address" | "phone" | "email"> }) {
  return (
    <article className="print-sheet mx-auto max-w-3xl rounded-xl border bg-white p-8 text-sm sm:p-10">
      <header className="flex items-start justify-between gap-6 border-b pb-5">
        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <div>
            <p className="text-lg font-semibold">{clinic.name}</p>
            <p className="text-xs text-muted-foreground">{clinic.address}</p>
            <p className="text-xs text-muted-foreground">
              {clinic.phone} · {clinic.email}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{rx.dentistName}</p>
          <p className="text-xs text-muted-foreground">{rx.dentistQualification}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 border-b py-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Patient</p>
          <p className="font-medium">{rx.patientName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Age / Sex</p>
          <p className="font-medium">
            {rx.patientAge ?? "—"} / {rx.patientGender ? rx.patientGender[0] : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="font-medium">{formatDate(rx.date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Rx no.</p>
          <p className="font-medium">{rx.id}</p>
        </div>
      </section>

      <section className="py-4">
        <p className="text-xs text-muted-foreground">Diagnosis</p>
        <p className="font-medium">{rx.diagnosis}</p>
      </section>

      <section>
        <p className="mb-2 font-serif text-3xl leading-none text-primary" aria-hidden>
          ℞
        </p>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Medicine</th>
              <th className="py-2 pr-2 font-medium">Dosage</th>
              <th className="py-2 pr-2 font-medium">Frequency</th>
              <th className="py-2 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rx.medicines.map((m, i) => (
              <tr key={i} className="border-b align-top last:border-0">
                <td className="py-2.5 pr-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2.5 pr-2">
                  <span className="font-medium">{m.name}</span>
                  {m.instructions && <span className="block text-xs text-muted-foreground">{m.instructions}</span>}
                </td>
                <td className="py-2.5 pr-2">{m.dosage}</td>
                <td className="py-2.5 pr-2">{m.frequency}</td>
                <td className="py-2.5">{m.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {rx.advice && (
        <section className="mt-5 rounded-lg bg-canvas p-4">
          <p className="text-xs text-muted-foreground">Advice</p>
          <p className="mt-1">{rx.advice}</p>
        </section>
      )}

      <footer className="mt-12 flex items-end justify-between">
        <p className="text-[11px] text-muted-foreground">Computer-generated prescription · demo data</p>
        <div className="text-right">
          <div className="mb-1 h-10 w-44 border-b" />
          <p className="text-xs font-medium">{rx.dentistName}</p>
        </div>
      </footer>
    </article>
  );
}
