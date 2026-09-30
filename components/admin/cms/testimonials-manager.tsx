"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, EyeOff, MessageSquareQuote, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { Testimonial, TestimonialStatus } from "@/types";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/page-header";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TestimonialStatusBadge } from "@/components/shared/status-badge";
import { Rating } from "@/components/shared/rating";
import { formatDate, toDateKey } from "@/lib/utils";
import { FormDialogShell } from "./form-dialog-shell";

const EMPTY: TestimonialInput = { patientName: "", location: "", rating: 5, review: "", treatment: "", date: toDateKey(new Date()), status: "PENDING" };

function TestimonialsManager({ items, treatments }: { items: Testimonial[]; treatments: string[] }) {
  const { save, patch, remove } = useResource("testimonials", "Testimonial");
  const [status, setStatus] = React.useState<"ALL" | TestimonialStatus>("ALL");
  const [editing, setEditing] = React.useState<{ open: boolean; value: Testimonial | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Testimonial | null>(null);
  const form = useForm<TestimonialInput>({ resolver: zodResolver(testimonialSchema), defaultValues: EMPTY });
  const shown = items.filter((t) => status === "ALL" || t.status === status);
  const count = (s: TestimonialStatus) => items.filter((t) => t.status === s).length;

  function open(value: Testimonial | null) {
    if (value) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = value;
      form.reset(rest);
    } else form.reset({ ...EMPTY, date: toDateKey(new Date()) });
    setEditing({ open: true, value });
  }

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Approve reviews before they appear on the website."
        actions={
          <Button onClick={() => open(null)}>
            <Plus /> Add testimonial
          </Button>
        }
      />
      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)} className="mb-5">
        <TabsList>
          <TabsTrigger value="ALL">All ({items.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({count("PENDING")})</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved ({count("APPROVED")})</TabsTrigger>
          <TabsTrigger value="HIDDEN">Hidden ({count("HIDDEN")})</TabsTrigger>
        </TabsList>
      </Tabs>
      {shown.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState icon={MessageSquareQuote} title="No testimonials here" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((t) => (
            <article key={t.id} className="flex flex-col rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{t.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.treatment} · {t.location} · {formatDate(t.date)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${t.patientName}'s review`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => open(t)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(t)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Rating value={t.rating} className="mt-3" />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">“{t.review}”</p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                <TestimonialStatusBadge status={t.status} />
                <div className="flex gap-2">
                  {t.status !== "APPROVED" && (
                    <Button size="sm" onClick={() => patch(t.id, { status: "APPROVED" }, "Testimonial approved and published.")}>
                      <Check /> Approve
                    </Button>
                  )}
                  {t.status !== "HIDDEN" && (
                    <Button size="sm" variant="outline" onClick={() => patch(t.id, { status: "HIDDEN" }, "Testimonial hidden from website.")}>
                      <EyeOff /> Hide
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <FormDialogShell
        open={editing.open}
        onOpenChange={(o) => setEditing((s) => ({ ...s, open: o }))}
        title={editing.value ? "Edit testimonial" : "Add testimonial"}
        form={form}
        onSubmit={(v) => save(editing.value?.id, v)}
        submitLabel={editing.value ? "Save changes" : "Add testimonial"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient name (as displayed)</FormLabel>
                <FormControl>
                  <Input placeholder="Priya P." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <Input placeholder="Vijay Nagar" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment</FormLabel>
                <FormControl>
                  <Input list="tst-treatments" {...field} />
                </FormControl>
                <datalist id="tst-treatments">
                  {treatments.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {"★".repeat(r)} {r}/5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending review</SelectItem>
                    <SelectItem value="APPROVED">Approved (visible)</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormDialogShell>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete testimonial?" onConfirm={() => remove(deleting!.id)} />
    </>
  );
}

export function TestimonialsScreen() {
  const query = combineQueries(useCollection("testimonials"), useCollection("services"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load testimonials"
      loading={
        <>
          <PageHeader title="Testimonials" description="Loading reviews…" />
          <CardGridSkeleton />
        </>
      }
    >
      {([items, services]) => <TestimonialsManager items={items} treatments={services.map((s) => s.name)} />}
    </RenderContent>
  );
}
