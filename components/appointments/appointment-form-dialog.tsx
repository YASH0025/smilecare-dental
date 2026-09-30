"use client";

import * as React from "react";
import { parse } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, UserPlus, Users } from "lucide-react";
import type { AppointmentView } from "@/types/views";
import type { BookingDentist, BookingService } from "@/components/booking/types";
import { appointmentCreateSchema, type AppointmentCreateInput } from "@/lib/validations/appointment";
import { useCreateAppointment } from "@/lib/query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlotPicker } from "@/components/booking/slot-picker";
import { useSlots } from "@/components/booking/use-slots";
import { dentistWorksOn } from "@/lib/utils/availability";
import { cn, formatDate, toDateKey } from "@/lib/utils";

export type PatientOption = { id: string; name: string; phone: string; email: string };

export function AppointmentFormDialog({
  open,
  onOpenChange,
  services,
  dentists,
  patients,
  defaults,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  services: BookingService[];
  dentists: BookingDentist[];
  patients: PatientOption[];
  defaults?: Partial<AppointmentCreateInput>;
  onCreated?: (a: AppointmentView) => void;
}) {
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const empty: AppointmentCreateInput = {
    patientId: undefined,
    patientName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    serviceId: "",
    dentistId: "",
    date: toDateKey(new Date()),
    time: "",
    reason: "",
    notes: "",
    status: "CONFIRMED",
    source: "PHONE",
  };
  const form = useForm<AppointmentCreateInput>({ resolver: zodResolver(appointmentCreateSchema), defaultValues: empty });
  const createAppointment = useCreateAppointment();

  React.useEffect(() => {
    if (open) {
      form.reset({ ...empty, ...defaults });
      setMode(defaults?.patientId ? "existing" : "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [patientId, serviceId, dentistId, date, time] = form.watch(["patientId", "serviceId", "dentistId", "date", "time"]);
  const eligible = dentists.filter((d) => !serviceId || d.serviceIds.includes(serviceId));
  const dentist = dentists.find((d) => d.id === dentistId);
  const slots = useSlots({ dentistId: open ? dentistId || undefined : undefined, date: open ? date : undefined, serviceId: serviceId || undefined });
  const selectedPatient = patients.find((p) => p.id === patientId);

  function pickPatient(p: PatientOption) {
    form.setValue("patientId", p.id);
    form.setValue("patientName", p.name, { shouldValidate: true });
    form.setValue("phone", p.phone, { shouldValidate: true });
    form.setValue("email", p.email ?? "");
    setPickerOpen(false);
  }

  async function onSubmit(values: AppointmentCreateInput) {
    try {
      const payload = mode === "new" ? { ...values, patientId: undefined } : values;
      const created = await createAppointment.mutateAsync(payload);
      onCreated?.(created);
      onOpenChange(false);
    } catch {
      slots.refetch(); // toast shown by the mutation; refresh availability in case the slot was taken
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>Book on behalf of a patient (phone or walk-in). Double bookings are blocked automatically.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <section className="space-y-4">
              <Tabs
                value={mode}
                onValueChange={(v) => {
                  setMode(v as "existing" | "new");
                  form.setValue("patientId", undefined);
                  form.setValue("patientName", "");
                  form.setValue("phone", "");
                  form.setValue("email", "");
                }}
              >
                <TabsList>
                  <TabsTrigger value="existing">
                    <Users /> Existing patient
                  </TabsTrigger>
                  <TabsTrigger value="new">
                    <UserPlus /> New patient
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {mode === "existing" ? (
                <FormField
                  control={form.control}
                  name="patientName"
                  render={() => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" role="combobox" aria-expanded={pickerOpen} className="w-full justify-between font-normal">
                              {selectedPatient ? (
                                <span className="truncate">
                                  {selectedPatient.name} <span className="text-muted-foreground">· {selectedPatient.phone}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Search by name, phone or ID…</span>
                              )}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search patients…" />
                            <CommandList>
                              <CommandEmpty>No patient found.</CommandEmpty>
                              <CommandGroup>
                                {patients.map((p) => (
                                  <CommandItem key={p.id} value={`${p.name} ${p.phone} ${p.id}`} onSelect={() => pickPatient(p)}>
                                    <Check className={cn("size-4", p.id === patientId ? "opacity-100" : "opacity-0")} />
                                    <span className="flex-1 truncate">{p.name}</span>
                                    <span className="text-xs text-muted-foreground">{p.id}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
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
                        <FormLabel>Mobile</FormLabel>
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
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        if (!dentists.find((d) => d.id === dentistId)?.serviceIds.includes(v)) form.setValue("dentistId", "");
                        form.setValue("time", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} · {s.duration} min
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
                name="dentistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dentist</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("time", "");
                      }}
                      disabled={!serviceId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={serviceId ? "Select dentist" : "Choose a service first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eligible.map((d) => (
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
            </section>

            <section className="grid gap-4 md:grid-cols-[auto_1fr]">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full justify-start font-normal md:w-[220px]">
                            <CalendarIcon className="text-muted-foreground" />
                            {field.value ? formatDate(field.value, "EEE, d MMM yyyy") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                          defaultMonth={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                          onSelect={(d) => {
                            if (d) {
                              field.onChange(toDateKey(d));
                              form.setValue("time", "");
                            }
                          }}
                          disabled={dentist ? (d: Date) => !dentistWorksOn(dentist, d) : undefined}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={() => (
                  <FormItem className="min-w-0">
                    <FormLabel>Time</FormLabel>
                    {dentistId ? (
                      <SlotPicker data={slots.data} loading={slots.loading} error={slots.error} value={time} onChange={(t) => form.setValue("time", t, { shouldValidate: true })} />
                    ) : (
                      <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">Select a service and dentist to see free slots.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="PHONE">Phone</SelectItem>
                        <SelectItem value="WALK_IN">Walk-in</SelectItem>
                        <SelectItem value="ADMIN">Clinic staff</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Reason for visit</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Creating…" : "Create appointment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
