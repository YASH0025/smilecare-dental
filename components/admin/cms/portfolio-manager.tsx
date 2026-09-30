"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Images, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { PortfolioItem } from "@/types";
import { portfolioSchema, type PortfolioInput } from "@/lib/validations/cms";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/page-header";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PublishedBadge } from "@/components/shared/status-badge";
import { ImageInput } from "@/components/forms/cms-inputs";
import { CompareSlider } from "@/components/public/before-after";
import { FormDialogShell } from "./form-dialog-shell";

const EMPTY: PortfolioInput = { title: "", treatment: "", category: "", beforeImage: "", afterImage: "", description: "", duration: "", dentistId: "", published: true };

function PortfolioManager({ items, dentists, treatments }: { items: PortfolioItem[]; dentists: { id: string; name: string }[]; treatments: string[] }) {
  const { save, patch, remove } = useResource("portfolio", "Portfolio entry");
  const [editing, setEditing] = React.useState<{ open: boolean; value: PortfolioItem | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<PortfolioItem | null>(null);
  const [category, setCategory] = React.useState("ALL");
  const form = useForm<PortfolioInput>({ resolver: zodResolver(portfolioSchema), defaultValues: EMPTY });
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const names = Object.fromEntries(dentists.map((d) => [d.id, d.name]));
  const shown = items.filter((i) => category === "ALL" || i.category === category);

  function open(value: PortfolioItem | null) {
    if (value) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = value;
      form.reset(rest);
    } else form.reset({ ...EMPTY, dentistId: dentists[0]?.id ?? "" });
    setEditing({ open: true, value });
  }

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Before & after cases shown on the website."
        actions={
          <Button onClick={() => open(null)}>
            <Plus /> Add case
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["ALL", ...categories].map((c) => (
          <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}>
            {c === "ALL" ? "All" : c}
          </Button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState icon={Images} title="No portfolio cases" description="Add a before/after case to showcase results." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((i) => (
            <article key={i.id} className="rounded-xl border bg-white p-3 shadow-[var(--shadow-soft)]">
              <CompareSlider before={i.beforeImage} after={i.afterImage} alt={i.title} />
              <div className="flex items-start justify-between gap-3 px-2 pt-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{i.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {i.treatment} · {i.category} · {names[i.dentistId] ?? "—"} · {i.duration}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${i.title}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => open(i)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(i)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex items-center justify-between border-t px-2 pt-3">
                <PublishedBadge published={i.published} />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Published
                  <Switch checked={i.published} onCheckedChange={(c) => patch(i.id, { published: c }, c ? "Case published." : "Case unpublished.")} />
                </label>
              </div>
            </article>
          ))}
        </div>
      )}

      <FormDialogShell
        open={editing.open}
        onOpenChange={(o) => setEditing((s) => ({ ...s, open: o }))}
        title={editing.value ? "Edit portfolio case" : "Add portfolio case"}
        description="Only publish images you have patient consent for."
        form={form}
        onSubmit={(v) => save(editing.value?.id, v)}
        submitLabel={editing.value ? "Save changes" : "Add case"}
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input list="pf-treatments" {...field} />
                </FormControl>
                <datalist id="pf-treatments">
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input list="pf-categories" placeholder="Cosmetic, Implants…" {...field} />
                </FormControl>
                <datalist id="pf-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dentistId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dentist</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dentists.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment duration</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 3 months" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="beforeImage"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Before image</FormLabel>
                <ImageInput value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="afterImage"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>After image</FormLabel>
                <ImageInput value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Published</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </FormDialogShell>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title={`Delete "${deleting?.title ?? ""}"?`} onConfirm={() => remove(deleting!.id)} />
    </>
  );
}

export function PortfolioScreen() {
  const query = combineQueries(useCollection("portfolio"), useCollection("dentists"), useCollection("services"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load portfolio"
      loading={
        <>
          <PageHeader title="Portfolio" description="Loading cases…" />
          <CardGridSkeleton media />
        </>
      }
    >
      {([items, dentists, services]) => <PortfolioManager items={items} dentists={dentists.map((d) => ({ id: d.id, name: d.name }))} treatments={services.map((s) => s.name)} />}
    </RenderContent>
  );
}
