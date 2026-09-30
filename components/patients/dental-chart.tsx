"use client";

import * as React from "react";
import { Loader2, MousePointerClick, X } from "lucide-react";
import { TOOTH_CONDITIONS, type DentalChart as Chart, type Patient, type ToothCondition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOWER_TEETH, TOOTH_CONDITION_META, UPPER_TEETH } from "@/lib/constants";
import { useUpdateTeeth } from "@/lib/query";
import { cn, formatDateTime } from "@/lib/utils";

const toothKind = (n: string) => {
  const pos = Number(n[1]);
  return pos <= 2 ? "incisor" : pos === 3 ? "canine" : pos <= 5 ? "premolar" : "molar";
};

function ToothGlyph({ number, condition, upper }: { number: string; condition: ToothCondition; upper: boolean }) {
  const meta = TOOTH_CONDITION_META[condition];
  const kind = toothKind(number);
  const w = kind === "molar" ? 38 : kind === "premolar" ? 31 : kind === "canine" ? 27 : 25;
  const missing = condition === "MISSING";
  const crown = upper ? "M3 16 Q3 4 15 4 Q27 4 27 16 L25 30 Q15 34 5 30 Z" : "M3 18 L5 4 Q15 0 25 4 L27 18 Q27 30 15 30 Q3 30 3 18 Z";
  const root = upper ? (kind === "molar" ? "M8 4 L6 -8 M22 4 L24 -8 M15 4 L15 -6" : "M15 4 L15 -9") : kind === "molar" ? "M8 30 L6 42 M22 30 L24 42" : "M15 30 L15 43";
  return (
    <svg viewBox="0 -10 30 54" width={w} height={w * 1.8} aria-hidden className="overflow-visible">
      <path d={root} stroke={missing ? "#cbd5e1" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeDasharray={missing ? "2 3" : undefined} />
      <path
        d={crown}
        fill={missing ? "transparent" : meta.fill}
        stroke={meta.stroke}
        strokeWidth={condition === "HEALTHY" ? 1.5 : 2.2}
        strokeDasharray={missing ? "3 3" : undefined}
      />
      {condition === "ROOT_CANAL" && <path d={upper ? "M15 22 L15 -6" : "M15 10 L15 40"} stroke={meta.stroke} strokeWidth="2.4" strokeLinecap="round" />}
      {condition === "IMPLANT" && (
        <g stroke={meta.stroke} strokeWidth="1.6">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="10" x2="20" y1={upper ? -6 + i * 3 : 32 + i * 3} y2={upper ? -5 + i * 3 : 33 + i * 3} />
          ))}
        </g>
      )}
      {condition === "EXTRACTION_REQUIRED" && <path d="M8 10 L22 24 M22 10 L8 24" stroke={meta.stroke} strokeWidth="2.2" strokeLinecap="round" />}
      {condition === "DECAY" && <circle cx="15" cy="17" r="4" fill={meta.stroke} opacity=".85" />}
      {condition === "FILLED" && <rect x="10" y="12" width="10" height="9" rx="2" fill={meta.stroke} opacity=".8" />}
      {condition === "CROWN" && <path d={upper ? "M3 16 Q3 4 15 4 Q27 4 27 16" : "M3 18 Q3 30 15 30 Q27 30 27 18"} stroke={meta.stroke} strokeWidth="4" fill="none" />}
    </svg>
  );
}

export function DentalChart({ patient, onSaved }: { patient: Patient; onSaved?: (p: Patient) => void }) {
  const [chart, setChart] = React.useState<Chart>(patient.dentalChart);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [condition, setCondition] = React.useState<ToothCondition>("DECAY");
  const [notes, setNotes] = React.useState("");
  const updateTeeth = useUpdateTeeth(patient.id);
  const saving = updateTeeth.isPending;

  React.useEffect(() => setChart(patient.dentalChart), [patient.dentalChart]);

  const condOf = (n: string): ToothCondition => chart[n]?.condition ?? "HEALTHY";
  const toggle = (n: string) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  async function apply() {
    if (!selected.length) return;
    try {
      const updated = await updateTeeth.mutateAsync({ teeth: selected, condition, notes: notes || undefined });
      setChart(updated.dentalChart);
      onSaved?.(updated);
      setSelected([]);
      setNotes("");
    } catch {
      /* toast shown by the mutation */
    }
  }

  const findings = Object.entries(chart).sort(([a], [b]) => a.localeCompare(b));
  const counts = TOOTH_CONDITIONS.map((c) => ({ c, n: c === "HEALTHY" ? 32 - findings.filter(([, r]) => r.condition !== "HEALTHY").length : findings.filter(([, r]) => r.condition === c).length }));

  const renderArch = (teeth: string[], upper: boolean) => (
    <div className="flex justify-center">
      <div role="group" aria-label={upper ? "Upper arch" : "Lower arch"} className="flex items-end gap-0.5 sm:gap-1">
        {teeth.map((n, i) => {
          const c = condOf(n);
          const isSel = selected.includes(n);
          return (
            <React.Fragment key={n}>
              {i === 8 && <span className="mx-1 w-px self-stretch bg-border sm:mx-2" aria-hidden />}
              <button
                type="button"
                onClick={() => toggle(n)}
                aria-pressed={isSel}
                aria-label={`Tooth ${n}: ${TOOTH_CONDITION_META[c].label}${chart[n]?.notes ? `, ${chart[n]?.notes}` : ""}`}
                title={`${n} · ${TOOTH_CONDITION_META[c].label}${chart[n]?.notes ? ` — ${chart[n]?.notes}` : ""}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-0.5 py-1.5 transition-colors hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:px-1",
                  upper ? "flex-col" : "flex-col-reverse",
                  isSel && "bg-accent ring-2 ring-primary",
                )}
              >
                <span className={cn("text-[10px] font-medium tabular-nums", isSel ? "text-primary" : "text-muted-foreground")}>{n}</span>
                <ToothGlyph number={n} condition={c} upper={upper} />
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="rounded-xl border bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointerClick className="size-4" aria-hidden /> Select one or more teeth, then apply a condition. FDI numbering.
          </p>
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              <X /> Clear ({selected.length})
            </Button>
          )}
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] space-y-3">
            <p className="text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Upper · Right ← → Left</p>
            {renderArch(UPPER_TEETH, true)}
            <div className="mx-auto h-px w-3/4 bg-border" aria-hidden />
            {renderArch(LOWER_TEETH, false)}
            <p className="text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Lower</p>
          </div>
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-xs" aria-label="Legend">
          {counts.map(({ c, n }) => (
            <li key={c} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-3 rounded-sm border-2" style={{ background: TOOTH_CONDITION_META[c].fill, borderColor: TOOTH_CONDITION_META[c].stroke }} aria-hidden />
              {TOOTH_CONDITION_META[c].label}
              <span className="tabular-nums text-foreground">{n}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold">Update selected teeth</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected.length ? `Selected: ${[...selected].sort().join(", ")}` : "No teeth selected"}
          </p>
          <div role="radiogroup" aria-label="Condition" className="mt-4 grid grid-cols-2 gap-1.5">
            {TOOTH_CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={condition === c}
                onClick={() => setCondition(c)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                  condition === c ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
              >
                <span className="size-3 shrink-0 rounded-sm border-2" style={{ background: TOOTH_CONDITION_META[c].fill, borderColor: TOOTH_CONDITION_META[c].stroke }} aria-hidden />
                {TOOTH_CONDITION_META[c].label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="tooth-notes">Clinical note (optional)</Label>
            <Input id="tooth-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Distal caries, monitor" />
          </div>
          <Button className="mt-4 w-full" onClick={apply} disabled={!selected.length || saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving…" : `Apply to ${selected.length || "selected"} ${selected.length === 1 ? "tooth" : "teeth"}`}
          </Button>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold">Recorded findings</h3>
          {findings.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">All teeth recorded as healthy.</p>
          ) : (
            <ul className="mt-3 divide-y text-sm">
              {findings.map(([n, r]) => (
                <li key={n} className="flex items-start justify-between gap-3 py-2">
                  <span>
                    <span className="font-semibold tabular-nums">{n}</span> <span className="text-muted-foreground">· {TOOTH_CONDITION_META[r.condition].label}</span>
                    {r.notes && <span className="block text-xs text-muted-foreground">{r.notes}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(r.updatedAt).split(",")[0]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
