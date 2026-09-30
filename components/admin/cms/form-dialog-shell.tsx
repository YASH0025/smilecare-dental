"use client";

import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

/** Standard dialog + form chrome shared by the smaller CMS editors. */
export function FormDialogShell<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  submitLabel,
  children,
  className = "sm:max-w-xl",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => Promise<unknown>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const submitting = form.formState.isSubmitting;
  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await onSubmit(values);
                onOpenChange(false);
              } catch {
                /* caller shows toast */
              }
            })}
            className="space-y-4"
            noValidate
          >
            {children}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {submitting ? "Saving…" : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
