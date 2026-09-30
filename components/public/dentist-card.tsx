import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { Dentist } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";

export function DentistCard({ dentist }: { dentist: Dentist }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[5/6] overflow-hidden bg-muted">
        <SmartImage src={dentist.photo} alt={`Portrait of ${dentist.name}`} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">{dentist.specialization}</p>
        <h3 className="mt-1.5 text-lg font-semibold">{dentist.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <GraduationCap className="mt-0.5 size-4 shrink-0" aria-hidden />
          {dentist.qualification}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm">
            <span className="font-semibold">{dentist.experienceYears}+ years</span>
            <span className="text-muted-foreground"> experience</span>
          </span>
          <Link
            href={`/dentists/${dentist.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            aria-label={`View profile of ${dentist.name}`}
          >
            View profile
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
