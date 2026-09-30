"use client";

import { BellRing, Database, Mail, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { SettingsSection } from "./section";

const EVENTS = [
  { event: "New appointment request", channels: "In-app · Email" },
  { event: "Appointment confirmed", channels: "In-app · Email · SMS" },
  { event: "Appointment cancelled", channels: "In-app · Email · SMS" },
  { event: "Appointment reminder", channels: "SMS · WhatsApp" },
  { event: "New patient registered", channels: "In-app" },
  { event: "Payment received", channels: "In-app · Email" },
  { event: "New website enquiry", channels: "In-app" },
];

export function SystemInfo() {
  return (
    <div>
      <SettingsSection title="Notifications" description="Events are recorded in notifications.json and appear in the bell menu. External delivery is simulated.">
        <ul className="divide-y rounded-lg border">
          {EVENTS.map((e) => (
            <li key={e.event} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span className="flex items-center gap-2">
                <BellRing className="size-4 text-muted-foreground" aria-hidden /> {e.event}
              </span>
              <span className="text-xs text-muted-foreground">{e.channels}</span>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { Icon: Mail, label: "Email", note: "Plug in Resend / SES" },
            { Icon: Phone, label: "SMS", note: "Plug in MSG91 / Twilio" },
            { Icon: MessageSquare, label: "WhatsApp", note: "Plug in WhatsApp Cloud API" },
          ].map(({ Icon, label, note }) => (
            <div key={label} className="rounded-lg border bg-canvas p-4">
              <Icon className="size-4 text-primary" aria-hidden />
              <p className="mt-2 text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">Simulated · {note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Integration point: <code className="rounded bg-muted px-1 py-0.5">lib/services/notification.service.ts → deliver()</code>
        </p>
      </SettingsSection>

      <SettingsSection title="Data storage" description="This version persists to JSON files on the server.">
        <div className="flex items-start gap-3 text-sm">
          <Database className="mt-0.5 size-4 text-primary" aria-hidden />
          <div>
            <p>
              All reads and writes go through the repository layer (<code className="rounded bg-muted px-1">lib/repositories</code>) with atomic, serialised writes.
            </p>
            <p className="mt-1 text-muted-foreground">
              Reset demo data at any time with <code className="rounded bg-muted px-1">npm run seed</code> — dates are regenerated relative to today.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck className="mt-0.5 size-4 text-primary" aria-hidden />
          <p className="text-muted-foreground">Demo only: do not enter real patient information. Replace demo authentication before any real deployment.</p>
        </div>
      </SettingsSection>
    </div>
  );
}
