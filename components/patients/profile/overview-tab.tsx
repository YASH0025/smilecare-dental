"use client";

import { AlertTriangle, CalendarClock, HeartPulse, IndianRupee, MapPin, Phone, Stethoscope } from "lucide-react";
import type { PatientProfile } from "@/types/views";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/shared/status-badge";
import { TOOTH_CONDITION_META } from "@/lib/constants";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export function OverviewTab({ profile, onOpenAppointment, onGoTo }: { profile: PatientProfile; onOpenAppointment: (id: string) => void; onGoTo: (tab: string) => void }) {
  const { patient, summary } = profile;
  const findings = Object.entries(patient.dentalChart);
  const active = profile.treatments.filter((t) => t.status === "IN_PROGRESS" || t.status === "PLANNED");

  const tiles = [
    { label: "Completed visits", value: summary.visits, Icon: Stethoscope },
    { label: "Last visit", value: summary.lastVisit ? formatDate(summary.lastVisit) : "—", Icon: CalendarClock },
    { label: "Total billed", value: formatCurrency(summary.totalBilled), Icon: IndianRupee },
    { label: "Outstanding", value: formatCurrency(summary.outstanding), Icon: IndianRupee, warn: summary.outstanding > 0 },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <t.Icon className="size-3.5" aria-hidden /> {t.label}
              </p>
              <p className={`mt-1.5 text-lg font-semibold tabular-nums ${t.warn ? "text-[var(--status-noshow)]" : ""}`}>{t.value}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Next appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.nextAppointment ? (
              <button
                onClick={() => onOpenAppointment(summary.nextAppointment!.id)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border bg-canvas p-4 text-left hover:border-primary/30"
              >
                <div>
                  <p className="font-medium">
                    {formatDate(summary.nextAppointment.date, "EEEE, d MMM")} · {formatTime(summary.nextAppointment.time)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {summary.nextAppointment.serviceName} with {summary.nextAppointment.dentistName}
                  </p>
                </div>
                <AppointmentStatusBadge status={summary.nextAppointment.status} />
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointment.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active treatment plans</CardTitle>
          </CardHeader>
          <CardContent>
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active treatment plans.</p>
            ) : (
              <ul className="space-y-3">
                {active.map((t) => {
                  const done = t.steps.filter((s) => s.done).length;
                  return (
                    <li key={t.id}>
                      <button onClick={() => onGoTo("treatments")} className="w-full rounded-lg border p-4 text-left hover:border-primary/30">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">{t.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {done}/{t.steps.length} steps
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(done / Math.max(1, t.steps.length)) * 100}%` }} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dental findings</CardTitle>
          </CardHeader>
          <CardContent>
            {findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No findings recorded — all teeth healthy.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {findings.map(([n, r]) => (
                  <button
                    key={n}
                    onClick={() => onGoTo("dental")}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                    style={{ borderColor: TOOTH_CONDITION_META[r.condition].stroke, background: TOOTH_CONDITION_META[r.condition].fill }}
                  >
                    <span className="font-semibold tabular-nums">{n}</span> {TOOTH_CONDITION_META[r.condition].label}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        {patient.allergies && !/none/i.test(patient.allergies) && (
          <div className="flex gap-3 rounded-xl border border-[var(--status-cancelled)]/25 bg-[var(--status-cancelled-bg)] p-4 text-sm text-[var(--status-cancelled)]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Allergy alert</p>
              <p>{patient.allergies}</p>
            </div>
          </div>
        )}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold">Personal details</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Date of birth</dt>
              <dd>{formatDate(patient.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Blood group</dt>
              <dd>{patient.bloodGroup || "—"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" aria-hidden /> Address
              </dt>
              <dd>{patient.address || "—"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" aria-hidden /> Emergency contact
              </dt>
              <dd>{patient.emergencyContact || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Registered</dt>
              <dd>{formatDate(patient.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <HeartPulse className="size-4 text-primary" aria-hidden /> Medical history
          </h3>
          <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{patient.medicalHistory || "Nothing recorded."}</p>
          <h3 className="mt-4 text-sm font-semibold">Allergies</h3>
          <p className="mt-1 text-sm text-muted-foreground">{patient.allergies || "None recorded."}</p>
        </div>
      </aside>
    </div>
  );
}
