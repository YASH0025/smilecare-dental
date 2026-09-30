"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations/cms";
import { useSubmitContact } from "@/lib/query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ContactForm({ services }: { services: string[] }) {
  const [sent, setSent] = React.useState(false);
  const submitContact = useSubmitContact();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", interestedService: "", message: "" },
  });

  async function onSubmit(values: ContactInput) {
    try {
      await submitContact.mutateAsync(values);
      setSent(true);
      form.reset();
    } catch {
      /* toast shown by the mutation */
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="size-10 text-[var(--status-completed)]" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Thank you — message received</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">Our front desk will contact you within one working day. For urgent pain, please call us directly.</p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-xl border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Your name" {...field} />
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
                  <Input type="tel" autoComplete="tel" placeholder="98260 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                <FormLabel>Interested in</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a treatment (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
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
                <Textarea rows={5} placeholder="How can we help?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          {form.formState.isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </Form>
  );
}
