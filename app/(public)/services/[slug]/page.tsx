import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Check, Clock, IndianRupee, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/public/section";
import { FaqList } from "@/components/public/faq-list";
import { BeforeAfterGallery } from "@/components/public/before-after";
import { CtaBand } from "@/components/public/cta-band";
import { ServiceCard } from "@/components/public/service-card";
import { SmartImage } from "@/components/shared/smart-image";
import { catalogService, portfolioService, settingsService, websiteContentService } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await catalogService.getServiceBySlug(slug, { publishedOnly: true });
  if (!s) return { title: "Service not found" };
  return {
    title: `${s.name} in Indore`,
    description: s.description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: `${s.name} | SmileCare Dental Clinic`, description: s.description, images: [{ url: s.image }] },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await catalogService.getServiceBySlug(slug, { publishedOnly: true });
  if (!service) notFound();

  const [dentists, portfolio, settings, content, all] = await Promise.all([
    catalogService.listDentists({ activeOnly: true, serviceId: service.id }),
    portfolioService.list((p) => p.published),
    settingsService.get(),
    websiteContentService.get(),
    catalogService.listServices({ publishedOnly: true }),
  ]);
  const cases = portfolio.filter(
    (p) => p.treatment.toLowerCase() === service.name.toLowerCase() || p.category.toLowerCase() === service.category.toLowerCase(),
  );
  const related = all.filter((s) => s.id !== service.id && s.category === service.category).slice(0, 3);
  const dentistNames = Object.fromEntries(dentists.map((d) => [d.id, d.name]));

  const faqs = service.faqs.map((f, i) => ({ id: `${service.id}-faq-${i}`, category: service.category, ...f }));

  return (
    <>
      <PageHero
        title={service.name}
        description={service.description}
        crumbs={[{ href: "/services", label: "Services" }, { label: service.name }]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={`/book-appointment?service=${service.id}`}>
              <CalendarPlus />
              Book {service.name}
            </Link>
          </Button>
          <span className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
            <Clock className="size-4 text-primary" aria-hidden /> {service.duration} minutes
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
            <IndianRupee className="size-4 text-primary" aria-hidden /> From {formatCurrency(service.price)}
          </span>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-14">
            <article aria-labelledby="overview">
              <h2 id="overview" className="text-2xl font-semibold">
                Overview
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-foreground/85">{service.content}</p>
            </article>

            {service.benefits.length > 0 && (
              <article aria-labelledby="benefits">
                <h2 id="benefits" className="text-2xl font-semibold">
                  Benefits
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 rounded-lg border bg-canvas p-4 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {service.whoNeedsIt.length > 0 && (
              <article aria-labelledby="who">
                <h2 id="who" className="text-2xl font-semibold">
                  Who needs it?
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {service.whoNeedsIt.map((w) => (
                    <li key={w} className="flex items-start gap-3 text-[15px] text-foreground/85">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      {w}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {service.procedure.length > 0 && (
              <article aria-labelledby="process">
                <h2 id="process" className="text-2xl font-semibold">
                  Treatment process
                </h2>
                <ol className="mt-6 space-y-0">
                  {service.procedure.map((step, i) => (
                    <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                      {i < service.procedure.length - 1 && <span className="absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-px bg-border" aria-hidden />}
                      <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-primary/20 bg-accent text-sm font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div className="pt-1.5">
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            )}

            {service.recovery && (
              <article aria-labelledby="recovery" className="rounded-xl border bg-teal-soft/50 p-6">
                <h2 id="recovery" className="text-lg font-semibold">
                  Recovery & aftercare
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">{service.recovery}</p>
              </article>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] bg-muted">
                <SmartImage src={service.image} alt={service.name} fill sizes="400px" className="object-cover" />
              </div>
              <div className="p-5">
                <h2 className="text-sm font-semibold">Pricing</h2>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {formatCurrency(service.price)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">starting</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your final cost depends on your clinical needs and is confirmed in writing after the consultation.
                </p>
                <Button asChild className="mt-5 w-full">
                  <Link href={`/book-appointment?service=${service.id}`}>Book appointment</Link>
                </Button>
              </div>
            </div>
            {dentists.length > 0 && (
              <div className="rounded-xl border p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Stethoscope className="size-4 text-primary" aria-hidden /> Treated by
                </h2>
                <ul className="mt-3 space-y-3">
                  {dentists.map((d) => (
                    <li key={d.id}>
                      <Link href={`/dentists/${d.slug}`} className="block rounded-md hover:text-primary">
                        <span className="text-sm font-medium">{d.name}</span>
                        <span className="block text-xs text-muted-foreground">{d.specialization}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {cases.length > 0 && (
        <Section muted>
          <h2 className="text-2xl font-semibold">Before & after</h2>
          <div className="mt-8">
            <BeforeAfterGallery items={cases} dentistNames={dentistNames} limit={2} />
          </div>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="eyebrow">FAQs</p>
              <h2 className="mt-3 text-2xl font-semibold">Questions about {service.name.toLowerCase()}</h2>
            </div>
            <FaqList faqs={faqs} withCategories={false} />
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section muted>
          <h2 className="text-2xl font-semibold">Related treatments</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand title={content.cta.title} subtitle={content.cta.subtitle} button={content.cta.button} phone={settings.phone} />
    </>
  );
}
