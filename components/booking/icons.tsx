export { CalendarDays, Clock, Phone, Stethoscope } from "lucide-react";

/** Tooth glyph (lucide has no tooth icon in this version). */
export function Tooth({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 3.5c-2.2 0-3.5 1.7-3.5 4 0 3 1.4 4.3 1.8 7 .4 2.8 1 6 2.4 6 1.6 0 1.4-4.5 3-4.5h.6c1.6 0 1.4 4.5 3 4.5 1.4 0 2-3.2 2.4-6 .4-2.7 1.8-4 1.8-7 0-2.3-1.3-4-3.5-4-1.7 0-2.6 1-4 1s-2.3-1-4-1Z" />
    </svg>
  );
}
