"use client";

import * as React from "react";

/** Two-column settings section: description on the left, fields on the right. */
export function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b py-8 first:pt-2 last:border-0 lg:grid-cols-[280px_1fr]">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4 rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">{children}</div>
    </section>
  );
}

export function StickySaveBar({ dirty, saving, onReset }: { dirty: boolean; saving: boolean; onReset: () => void }) {
  if (!dirty && !saving) return null;
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-4 rounded-xl border bg-white/95 px-5 py-3 shadow-[var(--shadow-lift)] backdrop-blur">
      <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onReset} disabled={saving} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
          Discard
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
