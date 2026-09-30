import Link from "next/link";
import { ArrowRight, CalendarPlus, Check, Star } from "lucide-react";
import type { Dentist, WebsiteContent } from "@/types";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";
import { initials } from "@/lib/utils";

export function Hero({ hero, rating, dentists }: { hero: WebsiteContent["hero"]; rating?: string; dentists: Dentist[] }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,#f3f7fe_0%,#ffffff_100%)]" />
      <div className="container-page grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[13px] font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
            <span className="size-1.5 rounded-full bg-teal" aria-hidden />
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 text-[40px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-[52px] lg:text-[58px]">
            {hero.title} <span className="text-primary">{hero.highlight}</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-muted-foreground">{hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/book-appointment">
                <CalendarPlus />
                {hero.primaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">
                {hero.secondaryCta}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-4">
            {hero.trustPoints.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
                  <Check className="size-3" aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="relative aspect-[24/26] overflow-hidden rounded-2xl border bg-accent shadow-[var(--shadow-lift)]">
            <SmartImage src={hero.image} alt="Modern treatment room at SmileCare Dental Clinic" fill priority sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" />
          </div>

          {/* Floating trust cards */}
          <div className="absolute -bottom-6 -left-3 w-[230px] rounded-xl border bg-white p-4 shadow-[var(--shadow-lift)] sm:-left-8">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {dentists.slice(0, 3).map((d) => (
                  <span key={d.id} className="grid size-8 place-items-center rounded-full border-2 border-white bg-accent text-[11px] font-semibold text-accent-foreground">
                    {initials(d.name)}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-tight text-muted-foreground">
                <span className="block font-semibold text-foreground">MDS specialists</span>
                on every treatment
              </p>
            </div>
          </div>
          {rating && (
            <div className="absolute -top-4 -right-2 rounded-xl border bg-white px-4 py-3 shadow-[var(--shadow-lift)] sm:-right-6">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                <span className="text-lg font-semibold">{rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Average patient rating</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
