"use client";

import type { Control } from "react-hook-form";
import type { BookingInput } from "@/lib/validations/appointment";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function StepDetails({ control }: { control: Control<BookingInput> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="As on your ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="98260 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
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
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reason for visit</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Pain in lower right tooth for 3 days" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Additional notes <span className="font-normal text-muted-foreground">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Allergies, medications, anxiety, accessibility needs…" {...field} />
            </FormControl>
            <FormDescription>Only your dental team can see this.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
