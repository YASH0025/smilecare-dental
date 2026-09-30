"use client";

import { CalendarDays, Loader2, MoreHorizontal, Pencil, Stethoscope, Trash2 } from "lucide-react";
import type { Treatment } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TreatmentStatusBadge } from "@/components/shared/status-badge";
import { useToggleTreatmentStep } from "@/lib/query";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

/** Treatment plan card with a live checklist (✓ done / ○ pending). */
export function TreatmentCard({
  treatment,
  patientName,
  dentistName,
  onChanged,
  onEdit,
  onDelete,
}: {
  treatment: Treatment;
  patientName?: string;
  dentistName: string;
  onChanged?: (t: Treatment) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const toggleStep = useToggleTreatmentStep();
  const savingStep = toggleStep.isPending && toggleStep.variables?.id === treatment.id ? toggleStep.variables.stepId : null;
  const done = treatment.steps.filter((s) => s.done).length;
  const pct = Math.round((done / Math.max(1, treatment.steps.length)) * 100);

  async function toggle(stepId: string, value: boolean) {
    const steps = treatment.steps.map((s) => (s.id === stepId ? { ...s, done: value } : s));
    try {
      const updated = await toggleStep.mutateAsync({ id: treatment.id, steps, done: value, stepId });
      onChanged?.(updated);
    } catch {
      /* toast shown by the mutation */
    }
  }

  return (
    <article className="flex flex-col rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{treatment.title}</h3>
            <TreatmentStatusBadge status={treatment.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {treatment.id}
            {patientName && <> · {patientName}</>}
            {treatment.teeth.length > 0 && <> · Teeth {treatment.teeth.join(", ")}</>}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${treatment.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit plan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done} of {treatment.steps.length} steps
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Treatment progress">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {treatment.steps.map((s) => (
          <li key={s.id}>
            <label className={cn("flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60", treatment.status === "CANCELLED" && "pointer-events-none opacity-60")}>
              {savingStep === s.id ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Checkbox checked={s.done} onCheckedChange={(c) => toggle(s.id, Boolean(c))} disabled={Boolean(savingStep)} />
              )}
              <span className={cn(s.done && "text-muted-foreground line-through decoration-muted-foreground/40")}>{s.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
        <div>
          <dt className="text-muted-foreground">Cost</dt>
          <dd className="mt-0.5 text-sm font-semibold">{formatCurrency(treatment.cost)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Stethoscope className="size-3" aria-hidden /> Dentist
          </dt>
          <dd className="mt-0.5 truncate text-sm font-medium">{dentistName}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="size-3" aria-hidden /> Started
          </dt>
          <dd className="mt-0.5 text-sm">{formatDate(treatment.startDate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{treatment.endDate ? "Completed" : "Follow-up"}</dt>
          <dd className="mt-0.5 text-sm">{formatDate(treatment.endDate ?? treatment.followUpDate)}</dd>
        </div>
      </dl>
      {treatment.notes && <p className="mt-3 rounded-md bg-canvas p-3 text-xs leading-relaxed text-muted-foreground">{treatment.notes}</p>}
    </article>
  );
}
