"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Sparkles, Star, Trash2, X } from "lucide-react";
import type { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PublishedBadge } from "@/components/shared/status-badge";
import { SmartImage } from "@/components/shared/smart-image";
import { formatCurrency } from "@/lib/utils";
import { ServiceFormDialog } from "./service-form-dialog";

function ServicesManager({ services }: { services: Service[] }) {
  const { save, patch, remove } = useResource("services", "Service");
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [form, setForm] = React.useState<{ open: boolean; value: Service | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Service | null>(null);

  const categories = Array.from(new Set(services.map((s) => s.category))).sort();
  const filtered = services.filter(
    (s) => (category === "ALL" || s.category === category) && (!q || `${s.name} ${s.slug} ${s.category}`.toLowerCase().includes(q.toLowerCase())),
  );
  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(filtered);

  return (
    <>
      <PageHeader
        title="Services"
        description="Manage treatments shown on the website, service pages and online booking."
        actions={
          <Button onClick={() => setForm({ open: true, value: null })}>
            <Plus /> New service
          </Button>
        }
      />
      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search services">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by category">
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
        {filtered.length === 0 ? (
          <EmptyState icon={Sparkles} title="No services found" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <SmartImage src={s.image} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span>
                          <span className="flex items-center gap-1.5 font-medium">
                            {s.name}
                            {s.featured && <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />}
                          </span>
                          <span className="block text-xs text-muted-foreground">/services/{s.slug}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.category}</TableCell>
                    <TableCell>{s.duration} min</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(s.price)}</TableCell>
                    <TableCell>
                      <PublishedBadge published={s.published} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={s.published}
                        onCheckedChange={(c) => patch(s.id, { published: c }, c ? `${s.name} published.` : `${s.name} unpublished.`)}
                        aria-label={`${s.published ? "Unpublish" : "Publish"} ${s.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${s.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setForm({ open: true, value: s })}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => patch(s.id, { featured: !s.featured }, s.featured ? "Removed from featured." : "Marked as featured.")}>
                            <Star /> {s.featured ? "Unfeature" : "Feature on home"}
                          </DropdownMenuItem>
                          {s.published && (
                            <DropdownMenuItem asChild>
                              <Link href={`/services/${s.slug}`} target="_blank">
                                <ExternalLink /> View on website
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(s)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </TableCard>
      <ServiceFormDialog
        open={form.open}
        onOpenChange={(o) => setForm((s) => ({ ...s, open: o }))}
        service={form.value}
        categories={categories}
        onSubmit={(values) => save(form.value?.id, values)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "service"}?`}
        description="This action cannot be undone. Services with upcoming appointments can't be deleted — unpublish them instead."
        onConfirm={() => remove(deleting!.id)}
      />
    </>
  );
}

export function ServicesScreen() {
  const query = combineQueries(useCollection("services"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load services"
      loading={
        <>
          <PageHeader title="Services" description="Loading services…" />
          <TableSkeleton columns={7} />
        </>
      }
    >
      {([services]) => <ServicesManager services={services} />}
    </RenderContent>
  );
}
