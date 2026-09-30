import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Clock, GraduationCap, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/public/section";
import { SmartImage } from "@/components/shared/smart-image";
import { catalogService } from "@/lib/services";
import { WEEKDAYS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await catalogService.getDentistBySlug(slug);
  if (!d) return { title: "Dentist not found" };
  return {
    title: `${d.name} — ${d.specialization}`,
    description: `${d.name}, ${d.qualification}. ${d.experienceYears}+ years of experience in ${d.specialization.toLowerCase()} at SmileCare, Indore.`,
    openGraph: { title: d.name, description: d.specialization, images: [{ url: d.photo }] },
  };
}

export default async function DentistProfilePage({ params }: Props) {
  const { slug } = await params;
  const dentist = await catalogService.getDentistBySlug(slug);
  if (!dentist) notFound();
  const services = (await catalogService.listServices({ publishedOnly: true })).filter((s) => dentist.serviceIds.includes(s.id));
  const days = [1, 2, 3, 4, 5, 6, 0].map((d) => dentist.workingHours.find((w) => w.day === d)!).filter(Boolean);

  return (
    <>
      <PageHero title={dentist.name} description={dentist.specialization} crumbs={[{ href: "/dentists", label: "Dentists" }, { label: dentist.name }]} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <div className="relative aspect-[5/6] overflow-hidden rounded-2xl border bg-muted">
              <SmartImage src={dentist.photo} alt={`Portrait of ${dentist.name}`} fill sizes="380px" className="object-cover" priority />
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href={`/book-appointment?dentist=${dentist.id}`}>
                <CalendarPlus />
                Book with {dentist.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
              </Link>
            </Button>
            <div className="rounded-xl border p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="size-4 text-primary" aria-hidden /> Consulting hours
              </h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                {days.map((d) => (
                  <div key={d.day} className="flex justify-between">
                    <dt className="text-muted-foreground">{WEEKDAYS[d.day]}</dt>
                    <dd className="font-medium">{d.enabled ? `${formatTime(d.start)} – ${formatTime(d.end)}` : "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
          <div>
            <p className="eyebrow">About</p>
            <p className="mt-3 text-[17px] leading-relaxed text-foreground/90">{dentist.bio}</p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-canvas p-4">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="size-4" aria-hidden /> Qualification
                </dt>
                <dd className="mt-1.5 text-sm font-medium">{dentist.qualification}</dd>
              </div>
              <div className="rounded-xl border bg-canvas p-4">
                <dt className="text-xs text-muted-foreground">Experience</dt>
                <dd className="mt-1.5 text-sm font-medium">{dentist.experienceYears}+ years</dd>
              </div>
              <div className="rounded-xl border bg-canvas p-4">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Languages className="size-4" aria-hidden /> Languages
                </dt>
                <dd className="mt-1.5 text-sm font-medium">{dentist.languages.join(", ")}</dd>
              </div>
            </dl>
            <h2 className="mt-12 text-xl font-semibold">Treatments offered</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-accent/40">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{s.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
