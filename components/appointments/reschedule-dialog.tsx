"use client";

import * as React from "react";
import { parse } from "date-fns";
import { Loader2 } from "lucide-react";
import type { AppointmentView } from "@/types/views";
import type { BookingDentist } from "@/components/booking/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlotPicker } from "@/components/booking/slot-picker";
import { useSlots } from "@/components/booking/use-slots";
import { dentistWorksOn } from "@/lib/utils/availability";
import { formatDate, formatTime, toDateKey } from "@/lib/utils";

export function RescheduleDialog({
  appointment,
  dentist,
  open,
  onOpenChange,
  onSubmit,
}: {
  appointment: AppointmentView | null;
  dentist?: Pick<BookingDentist, "workingHours" | "leaves">;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (date: string, time: string, note: string) => Promise<unknown>;
}) {
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && appointment) {
      setDate(appointment.date);
      setTime("");
      setNote("");
    }
  }, [open, appointment]);

  const slots = useSlots({
    dentistId: open ? appointment?.dentistId : undefined,
    date: open ? date : undefined,
    serviceId: appointment?.serviceId,
    excludeId: appointment?.id,
  });

  async function save() {
    if (!date || !time) return;
    setSaving(true);
    try {
      await onSubmit(date, time, note);
      onOpenChange(false);
    } catch {
      slots.refetch();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {appointment
              ? `${appointment.patientName} · currently ${formatDate(appointment.date)} at ${formatTime(appointment.time)} with ${appointment.dentistName}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="rounded-lg border md:w-fit">
            <Calendar
              mode="single"
              selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
              defaultMonth={date ? parse(date, "yyyy-MM-dd", new Date()) : new Date()}
              onSelect={(d) => {
                if (d) {
                  setDate(toDateKey(d));
                  setTime("");
                }
              }}
              disabled={dentist ? (d: Date) => !dentistWorksOn(dentist, d) : undefined}
            />
          </div>
          <div className="min-w-0 space-y-4">
            <SlotPicker data={slots.data} loading={slots.loading} error={slots.error} value={time} onChange={setTime} />
            <div className="grid gap-2">
              <Label htmlFor="reschedule-note">Reason (optional)</Label>
              <Input id="reschedule-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Patient requested a later time" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!date || !time || saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving…" : time ? `Move to ${formatDate(date, "d MMM")}, ${formatTime(time)}` : "Select a slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
