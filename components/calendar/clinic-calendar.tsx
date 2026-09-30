"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";

export type CalendarViewName = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export interface ClinicCalendarHandle {
  prev(): void;
  next(): void;
  today(): void;
  gotoDate(date: Date | string): void;
  changeView(view: CalendarViewName): void;
}

/**
 * Thin FullCalendar wrapper, loaded client-side only via next/dynamic (see calendar-view.tsx).
 * The imperative API is exposed through `apiRef` because dynamic() does not forward refs.
 */
export default function ClinicCalendar({
  apiRef,
  events,
  initialView,
  initialDate,
  onEventClick,
  onDateClick,
  onDatesSet,
}: {
  apiRef: React.RefObject<ClinicCalendarHandle | null>;
  events: EventInput[];
  initialView: CalendarViewName;
  initialDate?: string;
  onEventClick: (id: string) => void;
  onDateClick: (date: string, time?: string) => void;
  onDatesSet: (arg: DatesSetArg) => void;
}) {
  const calRef = React.useRef<FullCalendar>(null);

  React.useImperativeHandle(apiRef, () => ({
    prev: () => calRef.current?.getApi().prev(),
    next: () => calRef.current?.getApi().next(),
    today: () => calRef.current?.getApi().today(),
    gotoDate: (d) => calRef.current?.getApi().gotoDate(d),
    changeView: (v) => calRef.current?.getApi().changeView(v),
  }));

  return (
    <FullCalendar
      ref={calRef}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView={initialView}
      initialDate={initialDate}
      headerToolbar={false}
      events={events}
      height="auto"
      firstDay={1}
      nowIndicator
      dayMaxEvents={3}
      slotMinTime="09:00:00"
      slotMaxTime="20:00:00"
      slotDuration="00:30:00"
      allDaySlot={false}
      expandRows
      stickyHeaderDates
      eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
      slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
      views={{ listWeek: { buttonText: "Agenda", noEventsContent: "No appointments in this period" } }}
      eventClick={(arg: EventClickArg) => {
        arg.jsEvent.preventDefault();
        onEventClick(arg.event.id);
      }}
      dateClick={(arg: DateClickArg) => {
        const d = arg.date;
        const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const time = arg.allDay ? undefined : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        onDateClick(date, time);
      }}
      datesSet={onDatesSet}
      eventContent={(arg: EventContentArg) => {
        const p = arg.event.extendedProps as { serviceName: string; dentistName: string };
        if (arg.view.type === "listWeek") {
          return (
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium">{arg.event.title}</span>
              <span className="text-xs text-muted-foreground">
                {p.serviceName} · {p.dentistName}
              </span>
            </span>
          );
        }
        if (arg.view.type === "dayGridMonth") {
          return (
            <span className="block truncate text-[12px] leading-snug">
              <span className="font-semibold">{arg.timeText}</span> {arg.event.title}
            </span>
          );
        }
        return (
          <span className="block overflow-hidden text-[12px] leading-snug">
            <span className="block truncate font-semibold">{arg.event.title}</span>
            <span className="block truncate opacity-80">
              {arg.timeText.split(" - ")[0]} · {p.serviceName}
            </span>
          </span>
        );
      }}
    />
  );
}
