"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse } from "date-fns";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { AppointmentView } from "@/types/views";
import { bookingSchema, type BookingInput } from "@/lib/validations/appointment";
import { ApiClientError } from "@/lib/api/client";
import { useBookAppointment } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { BookingDentist, BookingService } from "./types";
import { useSlots } from "./use-slots";
import { StepService } from "./step-service";
import { StepDentist } from "./step-dentist";
import { StepDate } from "./step-date";
import { SlotPicker } from "./slot-picker";
import { StepDetails } from "./step-details";
import { StepReview } from "./step-review";
import { BookingSummary } from "./booking-summary";
import { BookingSuccess } from "./booking-success";

const STEPS = [
  { key: "service", label: "Service" },
  { key: "dentist", label: "Dentist" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "details", label: "Your details" },
  { key: "review", label: "Confirm" },
] as const;

export function BookingWizard({
  services,
  dentists,
  bookingWindowDays,
  clinicPhone,
  initialServiceId,
  initialDentistId,
}: {
  services: BookingService[];
  dentists: BookingDentist[];
  bookingWindowDays: number;
  clinicPhone: string;
  initialServiceId?: string;
  initialDentistId?: string;
}) {
  const initialDentist = dentists.find((d) => d.id === initialDentistId);
  const [step, setStep] = React.useState(initialServiceId ? 1 : 0);
  const [booked, setBooked] = React.useState<AppointmentView | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const book = useBookAppointment();

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      serviceId: initialServiceId ?? "",
      dentistId: initialServiceId && initialDentist?.serviceIds.includes(initialServiceId) ? initialDentist.id : "",
      date: "",
      time: "",
      reason: "",
      notes: "",
    },
  });

  const [serviceId, dentistId, date, time] = form.watch(["serviceId", "dentistId", "date", "time"]);
  const service = services.find((s) => s.id === serviceId);
  const dentist = dentists.find((d) => d.id === dentistId);
  const eligibleDentists = React.useMemo(() => dentists.filter((d) => !serviceId || d.serviceIds.includes(serviceId)), [dentists, serviceId]);
  const slots = useSlots({ dentistId: step >= 3 ? dentistId : undefined, date: step >= 3 ? date : undefined, serviceId });

  // Move focus to the step heading for screen-reader and keyboard users.
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const set = (name: keyof BookingInput, value: string) => form.setValue(name, value, { shouldValidate: false, shouldDirty: true });

  const canContinue = [Boolean(serviceId), Boolean(dentistId), Boolean(date), Boolean(time), true, true][step];

  async function next() {
    if (step === 4) {
      const ok = await form.trigger(["fullName", "phone", "email", "dateOfBirth", "reason", "notes"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit(values: BookingInput) {
    try {
      const appointment = await book.mutateAsync(values);
      setBooked(appointment);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // Error toast comes from the mutation; if the slot was just taken, send the patient back to pick another.
      if (e instanceof ApiClientError && (e.code === "SLOT_UNAVAILABLE" || e.code === "DUPLICATE_APPOINTMENT")) {
        set("time", "");
        slots.refetch();
        setStep(3);
      }
    }
  }

  if (booked) {
    return <BookingSuccess appointment={booked} clinicPhone={clinicPhone} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {/* Stepper */}
          <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Booking progress">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[13px] font-medium transition-colors",
                    i === step && "bg-accent text-accent-foreground",
                    i < step && "text-foreground hover:bg-muted",
                    i > step && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border text-xs",
                      i < step && "border-primary bg-primary text-white",
                      i === step && "border-primary bg-white text-primary",
                    )}
                  >
                    {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className={cn(i !== step && "hidden sm:inline")}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-4 bg-border sm:w-6" aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
              {["Choose a treatment", "Choose your dentist", "Pick a date", "Pick a time", "Your details", "Review & confirm"][step]}
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              {
                [
                  "Not sure? Choose “Consultation & Digital X-Ray” and we'll guide you.",
                  "Only dentists who provide this treatment are shown.",
                  "Greyed-out days are unavailable for your dentist.",
                  "Booked times are shown but can't be selected.",
                  "We'll use these details to confirm your appointment.",
                  "Please check everything before sending your request.",
                ][step]
              }
            </p>

            {step === 0 && (
              <StepService
                services={services}
                value={serviceId}
                onChange={(id) => {
                  set("serviceId", id);
                  const stillEligible = dentists.find((d) => d.id === dentistId)?.serviceIds.includes(id);
                  if (!stillEligible) set("dentistId", "");
                  set("time", "");
                }}
              />
            )}
            {step === 1 && (
              <StepDentist
                dentists={eligibleDentists}
                value={dentistId}
                onChange={(id) => {
                  set("dentistId", id);
                  set("date", "");
                  set("time", "");
                }}
              />
            )}
            {step === 2 && dentist && (
              <StepDate
                dentist={dentist}
                windowDays={bookingWindowDays}
                value={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                onChange={(key) => {
                  set("date", key);
                  set("time", "");
                }}
              />
            )}
            {step === 3 && (
              <SlotPicker
                data={slots.data}
                loading={slots.loading}
                error={slots.error}
                value={time}
                onChange={(t) => set("time", t)}
                emptyAction={
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Choose another date
                  </Button>
                }
              />
            )}
            {step === 4 && <StepDetails control={form.control} />}
            {step === 5 && service && dentist && <StepReview values={form.getValues()} service={service} dentist={dentist} />}

            <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
              <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || form.formState.isSubmitting}>
                <ArrowLeft />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button key="continue" type="button" onClick={next} disabled={!canContinue}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <Button key="submit" type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Booking…" : "Confirm booking"}
                  {!form.formState.isSubmitting && <Check />}
                </Button>
              )}
            </div>
          </div>
        </div>

        <BookingSummary service={service} dentist={dentist} date={date} time={time} clinicPhone={clinicPhone} />
      </form>
    </Form>
  );
}
