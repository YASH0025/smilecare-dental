"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 text-center text-[0.75rem] font-medium text-muted-foreground",
        week: "mt-1.5 flex w-full",
        day: "relative flex-1 p-0 text-center text-sm",
        day_button: cn(
          "mx-auto flex size-9 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none disabled:pointer-events-none",
        ),
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:font-medium",
        today: "[&>button]:text-primary [&>button]:font-semibold",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/35 [&>button]:line-through [&>button]:decoration-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", chevronClass)} />
          ) : (
            <ChevronRightIcon className={cn("size-4", chevronClass)} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
