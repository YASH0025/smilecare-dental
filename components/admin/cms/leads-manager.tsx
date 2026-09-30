"use client";

import * as React from "react";
import { combineQueries, useCollection } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Inbox, Mail, MoreHorizontal, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/types";
import { leadSchema, type LeadInput } from "@/lib/validations/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DataToolbar, TableCard } from "@/components/admin/data-toolbar";
import { usePagination } from "@/components/admin/use-pagination";
import { useResource } from "@/components/admin/use-resource";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LEAD_STATUS_META } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { FormDialogShell } from "./form-dialog-shell";

const EMPTY: LeadInput = { name: "", phone: "", email: "", interestedService: "", message: "", source: "PHONE", status: "NEW", notes: "" };
const SOURCES = ["WEBSITE", "PHONE", "WALK_IN", "REFERRAL", "SOCIAL"] as const;

function LeadsManager({ items, services }: { items: Lead[]; services: string[] }) {
  const { save, patch, remove } = useResource("leads", "Lead");
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | LeadStatus>("ALL");
  const [editing, setEditing] = React.useState<{ open: boolean; value: Lead | null }>({ open: false, value: null });
  const [deleting, setDeleting] = React.useState<Lead | null>(null);
  const form = useForm<LeadInput>({ resolver: zodResolver(leadSchema), defaultValues: EMPTY });

  const needle = q.toLowerCase().trim();
  const shown = items.filter(
    (l) => (status === "ALL" || l.status === status) && (!needle || `${l.name} ${l.phone} ${l.email} ${l.interestedService} ${l.message}`.toLowerCase().includes(needle)),
  );
  const { page, setPage, pageCount, pageItems, total, pageSize } = usePagination(shown);
  const converted = items.filter((l) => l.status === "CONVERTED").length;

  function open(value: Lead | null) {
    if (value) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = value;
      form.reset(rest);
    } else form.reset(EMPTY);
    setEditing({ open: true, value });
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description={`Website enquiries and prospects · ${items.length ? Math.round((converted / items.length) * 100) : 0}% converted`}
        actions={
          <Button onClick={() => open(null)}>
            <Plus /> Add lead
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {LEAD_STATUSES.map((s) => {
          const n = items.filter((l) => l.status === s).length;
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(active ? "ALL" : s)}
              aria-pressed={active}
              className={cn("rounded-xl border bg-white p-4 text-left transition-colors hover:border-primary/30", active && "border-primary ring-1 ring-primary")}
            >
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: LEAD_STATUS_META[s].color }} aria-hidden />
                {LEAD_STATUS_META[s].label}
              </span>
              <span className="mt-1 block text-2xl font-semibold tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>

      <TableCard>
        <DataToolbar search={q} onSearch={setQ} placeholder="Search name, phone, service or message">
          {(q || status !== "ALL") && (
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setStatus("ALL");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </DataToolbar>
        {shown.length === 0 ? (
          <EmptyState icon={Inbox} title="No leads found" description="Enquiries from the website contact form appear here automatically." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Interested in</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.source.replace("_", "-").toLowerCase()}</p>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-sm hover:text-primary">
                        <Phone className="size-3.5" aria-hidden /> {l.phone}
                      </a>
                      {l.email && (
                        <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                          <Mail className="size-3" aria-hidden /> {l.email}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{l.interestedService || "—"}</TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{l.message || "—"}</p>
                      {l.notes && <p className="mt-0.5 line-clamp-1 text-xs text-foreground/70">Note: {l.notes}</p>}
                    </TableCell>
                    <TableCell>
                      <span title={formatDate(l.createdAt)}>{formatDistanceToNow(parseISO(l.createdAt), { addSuffix: true })}</span>
                    </TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => patch(l.id, { status: v as LeadStatus }, `Lead marked as ${LEAD_STATUS_META[v as LeadStatus].label.toLowerCase()}.`)}>
                        <SelectTrigger size="sm" className="w-[130px]" aria-label={`Status for ${l.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              <span className="size-2 rounded-full" style={{ backgroundColor: LEAD_STATUS_META[s].color }} aria-hidden />
                              {LEAD_STATUS_META[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${l.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => open(l)}>
                            <Pencil /> Edit / add note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(l)}>
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

      <FormDialogShell
        open={editing.open}
        onOpenChange={(o) => setEditing((s) => ({ ...s, open: o }))}
        title={editing.value ? `Lead · ${editing.value.name}` : "Add lead"}
        form={form}
        onSubmit={(v) => save(editing.value?.id, v)}
        submitLabel={editing.value ? "Save changes" : "Add lead"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interestedService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interested service</FormLabel>
                <FormControl>
                  <Input list="lead-services" {...field} />
                </FormControl>
                <datalist id="lead-services">
                  {services.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", "-").toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LEAD_STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal notes</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Call-back time, objections, next step…" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </FormDialogShell>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title={`Delete lead ${deleting?.name ?? ""}?`} onConfirm={() => remove(deleting!.id)} />
    </>
  );
}

export function LeadsScreen() {
  const query = combineQueries(useCollection("leads"), useCollection("services"));
  return (
    <RenderContent
      query={query}
      errorTitle="Couldn't load leads"
      loading={
        <>
          <PageHeader title="Leads" description="Loading enquiries…" />
          <TableSkeleton columns={7} />
        </>
      }
    >
      {([items, services]) => <LeadsManager items={items} services={services.map((s) => s.name)} />}
    </RenderContent>
  );
}
