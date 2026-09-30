"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/types";
import { gallerySchema, type GalleryInput } from "@/lib/validations/cms";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SmartImage } from "@/components/shared/smart-image";
import { ImageInput } from "@/components/forms/cms-inputs";
import { NumberInput } from "@/components/forms/fields";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import { FormDialogShell } from "./form-dialog-shell";

const EMPTY: GalleryInput = { title: "", category: "CLINIC", image: "", description: "", order: 1, published: true };

function GalleryManager({ items }: { items: GalleryItem[] }) {
  const { save, patch, remove } = useResource("gallery", "Gallery image");
  const [editing, setEditing] = React.useState<{ open: boolean; value: GalleryItem | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<GalleryItem | null>(null);
  const [category, setCategory] = React.useState("ALL");
  const form = useForm<GalleryInput>({ resolver: zodResolver(gallerySchema), defaultValues: EMPTY });
  const shown = items.filter((i) => category === "ALL" || i.category === category);

  function open(value: GalleryItem | null) {
    if (value) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = value;
      form.reset(rest);
    } else form.reset({ ...EMPTY, order: items.length + 1 });
    setEditing({ open: true, value });
  }

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Clinic, team, treatment, equipment and event photos."
        actions={
          <Button onClick={() => open(null)}>
            <Plus /> Add image
          </Button>
        }
      />
      <Tabs value={category} onValueChange={setCategory} className="mb-5">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="ALL">All ({items.length})</TabsTrigger>
          {GALLERY_CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>
              {GALLERY_CATEGORY_LABELS[c]} ({items.filter((i) => i.category === c).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {shown.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState icon={ImageIcon} title="No images in this category" />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
          {shown.map((i) => (
            <li key={i.id} className="overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[4/3] bg-muted">
                <SmartImage src={i.image} alt={i.title} fill sizes="320px" className={`object-cover ${i.published ? "" : "opacity-50 grayscale"}`} />
                <span className="absolute top-2 left-2 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-medium">#{i.order}</span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">{GALLERY_CATEGORY_LABELS[i.category]}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Switch checked={i.published} onCheckedChange={(c) => patch(i.id, { published: c }, c ? "Image published." : "Image hidden.")} aria-label={`Publish ${i.title}`} />
                  <div className="flex">
                    <Button variant="ghost" size="icon-sm" onClick={() => open(i)} aria-label={`Edit ${i.title}`}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(i)} aria-label={`Delete ${i.title}`}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <FormDialogShell
        open={editing.open}
        onOpenChange={(o) => setEditing((s) => ({ ...s, open: o }))}
        title={editing.value ? "Edit image" : "Add image"}
        form={form}
        onSubmit={(v) => save(editing.value?.id, v)}
        submitLabel={editing.value ? "Save changes" : "Add image"}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <ImageInput value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GALLERY_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {GALLERY_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display order</FormLabel>
                <FormControl>
                  <NumberInput min={0} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Input {...field} />
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
      </FormDialogShell>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title={`Delete "${deleting?.title ?? ""}"?`} onConfirm={() => remove(deleting!.id)} />
    </>
  );
}

export function GalleryScreen() {
  const query = combineQueries(useCollection("gallery"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load gallery"
      loading={
        <>
          <PageHeader title="Gallery" description="Loading images…" />
          <CardGridSkeleton count={8} media className="grid-cols-2 md:grid-cols-3 2xl:grid-cols-4" />
        </>
      }
    >
      {([items]) => <GalleryManager items={items} />}
    </RenderContent>
  );
}
