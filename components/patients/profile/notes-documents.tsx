"use client";

import * as React from "react";
import { FileImage, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import type { Patient, PatientDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAddDocument, useAddNote, useDeleteDocument, useDeleteNote } from "@/lib/query";
import { formatDate, formatDateTime, toDateKey } from "@/lib/utils";

export function NotesTab({ patient }: { patient: Patient; onChanged?: () => void }) {
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const addNote = useAddNote(patient.id);
  const deleteNote = useDeleteNote(patient.id);
  const saving = addNote.isPending;

  async function add() {
    if (!text.trim()) return;
    try {
      await addNote.mutateAsync(text);
      setText("");
    } catch {
      /* toast shown by the mutation */
    }
  }

  const remove = (id: string) => deleteNote.mutateAsync(id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="rounded-xl border bg-white p-5">
        <Label htmlFor="new-note">Add a clinical note</Label>
        <Textarea id="new-note" rows={5} className="mt-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Observations, preferences, follow-up reminders…" />
        <Button className="mt-3" onClick={add} disabled={!text.trim() || saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Plus />}
          {saving ? "Saving…" : "Add note"}
        </Button>
      </div>
      <div className="rounded-xl border bg-white">
        {patient.notes.length === 0 ? (
          <EmptyState title="No notes yet" description="Notes you add are visible to all clinic staff." />
        ) : (
          <ul className="divide-y">
            {patient.notes.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-sm whitespace-pre-line">{n.text}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {n.author} · {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(n.id)} aria-label="Delete note">
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete this note?" onConfirm={() => remove(deleting!)} />
    </div>
  );
}

const DOC_TYPES: { value: PatientDocument["type"]; label: string }[] = [
  { value: "X_RAY", label: "X-ray" },
  { value: "REPORT", label: "Report" },
  { value: "CONSENT", label: "Consent form" },
  { value: "PRESCRIPTION", label: "External prescription" },
  { value: "OTHER", label: "Other" },
];

export function DocumentsTab({ patient }: { patient: Patient; onChanged?: () => void }) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<PatientDocument["type"]>("X_RAY");
  const [date, setDate] = React.useState(toDateKey(new Date()));
  const [notes, setNotes] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const addDocument = useAddDocument(patient.id);
  const deleteDocument = useDeleteDocument(patient.id);
  const saving = addDocument.isPending;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addDocument.mutateAsync({ name, type, date, notes });
      setName("");
      setNotes("");
    } catch {
      /* toast shown by the mutation */
    }
  }

  const remove = (id: string) => deleteDocument.mutateAsync(id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <form onSubmit={add} className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">Add document record</h2>
        <p className="text-xs text-muted-foreground">The JSON demo stores document metadata only. File storage (S3, etc.) plugs in with the database migration.</p>
        <div className="grid gap-2">
          <Label htmlFor="doc-name">Name</Label>
          <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. OPG X-ray" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PatientDocument["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-date">Date</Label>
            <Input id="doc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="doc-notes">Notes</Label>
          <Input id="doc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" disabled={!name.trim() || saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Plus />}
          {saving ? "Saving…" : "Add record"}
        </Button>
      </form>
      <div className="rounded-xl border bg-white">
        {patient.documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents" description="X-rays, reports and consent forms will be listed here." />
        ) : (
          <ul className="divide-y">
            {patient.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary">
                    {d.type === "X_RAY" ? <FileImage className="size-4" /> : <FileText className="size-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DOC_TYPES.find((t) => t.value === d.type)?.label} · {formatDate(d.date)}
                      {d.notes && ` · ${d.notes}`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(d.id)} aria-label={`Remove ${d.name}`}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Remove document record?" onConfirm={() => remove(deleting!)} />
    </div>
  );
}
