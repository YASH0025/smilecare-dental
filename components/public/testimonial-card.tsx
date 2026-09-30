import { Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { Rating } from "@/components/shared/rating";
import { initials } from "@/lib/utils";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <Rating value={t.rating} />
        <Quote className="size-5 text-primary/25" aria-hidden />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">“{t.review}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
        <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{initials(t.patientName)}</span>
        <div>
          <p className="text-sm font-semibold">{t.patientName}</p>
          <p className="text-xs text-muted-foreground">
            {t.treatment}
            {t.location ? ` · ${t.location}` : ""}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
