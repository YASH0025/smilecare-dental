"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Faq } from "@/types";
import { faqSchema, type FaqInput } from "@/lib/validations/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { NumberInput } from "@/components/forms/fields";
import { FormDialogShell } from "./form-dialog-shell";

const EMPTY: FaqInput = { question: "", answer: "", category: "General", order: 1, published: true };

function FaqsManager({ items }: { items: Faq[] }) {
  const { save, patch, remove } = useResource("faqs", "FAQ");
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [editing, setEditing] = React.useState<{ open: boolean; value: Faq | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Faq | null>(null);
  const form = useForm<FaqInput>({ resolver: zodResolver(faqSchema), defaultValues: EMPTY });
  const categories = Array.from(new Set(items.map((f) => f.category)));
  const shown = items.filter((f) => (category === "ALL" || f.category === category) && (!q || `${f.question} ${f.answer}`.toLowerCase().includes(q.toLowerCase())));

  function open(value: Faq | null) {
    if (value) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = value;
      form.reset(rest);
    } else form.reset({ ...EMPTY, order: items.length + 1 });
    setEditing({ open: true, value });
  }

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Questions shown on the FAQ page and home page, grouped by category."
        actions={
          <Button onClick={() => open(null)}>
            <Plus /> Add FAQ
          </Button>
        }
      />
      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search questions">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(q || category !== "ALL") && (
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setCategory("ALL");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </DataToolbar>
        {shown.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No FAQs found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="tabular-nums text-muted-foreground">{f.order}</TableCell>
                  <TableCell className="max-w-[520px] whitespace-normal">
                    <p className="font-medium">{f.question}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{f.answer}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.category}</TableCell>
                  <TableCell>
                    <Switch checked={f.published} onCheckedChange={(c) => patch(f.id, { published: c }, c ? "FAQ published." : "FAQ unpublished.")} aria-label={`Publish: ${f.question}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="FAQ actions">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => open(f)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(f)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>
      <FormDialogShell
        open={editing.open}
        onOpenChange={(o) => setEditing((s) => ({ ...s, open: o }))}
        title={editing.value ? "Edit FAQ" : "Add FAQ"}
        form={form}
        onSubmit={(v) => save(editing.value?.id, v)}
        submitLabel={editing.value ? "Save changes" : "Add FAQ"}
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
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
                <FormControl>
                  <Input list="faq-categories" {...field} />
                </FormControl>
                <datalist id="faq-categories">
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
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
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
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete FAQ?" onConfirm={() => remove(deleting!.id)} />
    </>
  );
}

export function FaqsScreen() {
  const query = combineQueries(useCollection("faqs"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load faqs"
      loading={
        <>
          <PageHeader title="FAQs" description="Loading FAQs…" />
          <TableSkeleton columns={4} />
        </>
      }
    >
      {([items]) => <FaqsManager items={items} />}
    </RenderContent>
  );
}
