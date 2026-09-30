"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import Link from "next/link";
import { CalendarOff, Clock, ExternalLink, MoreHorizontal, Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import type { Dentist } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/page-header";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SmartImage } from "@/components/shared/smart-image";
import { WEEKDAYS } from "@/lib/constants";
import { formatDate, formatTime, toDateKey } from "@/lib/utils";
import { DentistFormDialog } from "./dentist-form-dialog";

function DentistsManager({ dentists, services }: { dentists: Dentist[]; services: { id: string; name: string; category: string }[] }) {
  const { save, patch, remove } = useResource("dentists", "Dentist");
  const [form, setForm] = React.useState<{ open: boolean; value: Dentist | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Dentist | null>(null);
  const today = toDateKey(new Date());

  return (
    <>
      <PageHeader
        title="Dentists"
        description="Profiles, services, working hours and leave. Changes update the website and booking slots immediately."
        actions={
          <Button onClick={() => setForm({ open: true, value: null })}>
            <Plus /> Add dentist
          </Button>
        }
      />
      {dentists.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState icon={Stethoscope} title="No dentists yet" description="Add your first dentist to enable online booking." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {dentists.map((d) => {
            const days = d.workingHours.filter((w) => w.enabled);
            const upcomingLeave = d.leaves.filter((l) => l.to >= today);
            return (
              <article key={d.id} className="flex flex-col rounded-xl border bg-white shadow-[var(--shadow-soft)]">
                <div className="flex gap-4 p-5">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <SmartImage src={d.photo} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{d.name}</h2>
                        <p className="truncate text-xs text-primary">{d.specialization}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{d.qualification}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${d.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setForm({ open: true, value: d })}>
                            <Pencil /> Edit profile & schedule
                          </DropdownMenuItem>
                          {d.active && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dentists/${d.slug}`} target="_blank">
                                <ExternalLink /> View public profile
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(d)}>
                            <Trash2 /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                <dl className="space-y-3 border-t px-5 py-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <dd>
                      {days.length ? (
                        <>
                          {days.map((w) => WEEKDAYS[w.day].slice(0, 3)).join(", ")}
                          <span className="block text-xs text-muted-foreground">
                            {formatTime(days[0].start)} – {formatTime(days[0].end)}
                            {days[0].breakStart && ` · break ${formatTime(days[0].breakStart)}–${formatTime(days[0].breakEnd)}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No working days set</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <dd>
                      {upcomingLeave.length ? (
                        upcomingLeave.map((l) => (
                          <span key={l.id} className="block">
                            {formatDate(l.from, "d MMM")}
                            {l.to !== l.from && ` – ${formatDate(l.to, "d MMM")}`} <span className="text-xs text-muted-foreground">{l.reason}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No upcoming leave</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <Stethoscope className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <dd className="text-muted-foreground">
                      {d.serviceIds.length} services ·{" "}
                      {services
                        .filter((s) => d.serviceIds.includes(s.id))
                        .slice(0, 3)
                        .map((s) => s.name)
                        .join(", ")}
                      {d.serviceIds.length > 3 && "…"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex items-center justify-between border-t px-5 py-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Switch checked={d.active} onCheckedChange={(c) => patch(d.id, { active: c }, c ? `${d.name} is now bookable.` : `${d.name} hidden from website and booking.`)} />
                    {d.active ? "Active" : "Inactive"}
                  </label>
                  <Button variant="outline" size="sm" onClick={() => setForm({ open: true, value: d })}>
                    <Pencil /> Edit
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <DentistFormDialog
        open={form.open}
        onOpenChange={(o) => setForm((s) => ({ ...s, open: o }))}
        dentist={form.value}
        services={services}
        onSubmit={(values) => save(form.value?.id, values)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove ${deleting?.name ?? "dentist"}?`}
        description="This action cannot be undone. Dentists with upcoming appointments can't be removed — mark them inactive instead."
        confirmLabel="Remove"
        onConfirm={() => remove(deleting!.id)}
      />
    </>
  );
}

export function DentistsScreen() {
  const query = combineQueries(useCollection("dentists"), useCollection("services"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load dentists"
      loading={
        <>
          <PageHeader title="Dentists" description="Loading dentists…" />
          <CardGridSkeleton count={3} />
        </>
      }
    >
      {([dentists, services]) => <DentistsManager dentists={dentists} services={services.map((s) => ({ id: s.id, name: s.name, category: s.category }))} />}
    </RenderContent>
  );
}
