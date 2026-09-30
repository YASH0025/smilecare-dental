"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { PatientOption } from "@/components/appointments/appointment-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

/** Searchable patient combobox (shadcn Command inside a Popover). */
export function PatientPicker({
  patients,
  value,
  onChange,
  disabled,
}: {
  patients: PatientOption[];
  value?: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = patients.find((p) => p.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between font-normal">
          {selected ? (
            <span className="truncate">
              {selected.name} <span className="text-muted-foreground">· {selected.id}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select patient…</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search patients…" />
          <CommandList>
            <CommandEmpty>No patient found.</CommandEmpty>
            <CommandGroup>
              {patients.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.phone} ${p.id}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", p.id === value ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Number input that stores real numbers (not strings) in React Hook Form. */
export function NumberInput({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      {...props}
      value={Number.isFinite(value) ? String(value) : ""}
      onChange={(e) => onChange(e.target.value === "" ? Number.NaN : e.target.valueAsNumber)}
    />
  );
}
