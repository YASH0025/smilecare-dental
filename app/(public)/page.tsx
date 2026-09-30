import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/public/hero";
import { StatsBand } from "@/components/public/stats-band";
import { Section, SectionHeader } from "@/components/public/section";
import { ServiceCard } from "@/components/public/service-card";
import { FeatureGrid } from "@/components/public/feature-grid";
import { DentistCard } from "@/components/public/dentist-card";
import { BeforeAfterGallery } from "@/components/public/before-after";
import { TestimonialCard } from "@/components/public/testimonial-card";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { FaqList } from "@/components/public/faq-list";
import { CtaBand } from "@/components/public/cta-band";
import {
  catalogService,
  faqService,
  galleryService,
  portfolioService,
  settingsService,
  testimonialService,
  websiteContentService,
} from "@/lib/services";

export default async function HomePage() {
  const [content, settings, services, dentists, portfolio, testimonials, gallery, faqs] = await Promise.all([
    websiteContentService.get(),
    settingsService.get(),
    catalogService.listServices({ publishedOnly: true }),
    catalogService.listDentists({ activeOnly: true }),
    portfolioService.list((p) => p.published),
    testimonialService.list((t) => t.status === "APPROVED"),
    galleryService.list((g) => g.published),
    faqService.list((f) => f.published),
  ]);

  const featured = [...services].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 6);
  const rating = content.stats.find((s) => /rating/i.test(s.label))?.value;
  const dentistNames = Object.fromEntries(dentists.map((d) => [d.id, d.name]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: settings.name,
    slogan: settings.tagline,
    telephone: settings.phone,
    email: settings.email,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city, addressRegion: "Madhya Pradesh", addressCountry: "IN" },
    openingHours: "Mo-Sa 10:00-19:00",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero hero={content.hero} rating={rating} dentists={dentists} />
      <StatsBand stats={content.stats} />

      <Section>
        <SectionHeader
          eyebrow="Treatments"
          title="Comprehensive care, from check-ups to complete smile makeovers"
          description="Every treatment is planned by a specialist and explained clearly — including cost — before we begin."
          action={
            <Button asChild variant="outline">
              <Link href="/services">
                View all services
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </Section>

      <Section muted>
        <SectionHeader
          eyebrow="Why SmileCare"
          title="Dentistry that feels calm, clear and personal"
          description="We've designed every part of the visit around your comfort and confidence."
        />
        <div className="mt-10">
          <FeatureGrid features={content.whyChooseUs} />
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Our dentists"
          title="Specialists you can trust"
          description="MDS-qualified specialists who work together on your care — so you always see the right expert."
          action={
            <Button asChild variant="outline">
              <Link href="/dentists">
                Meet the team
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dentists.map((d) => (
            <DentistCard key={d.id} dentist={d} />
          ))}
        </div>
      </Section>

      <Section muted>
        <SectionHeader
          eyebrow="Before & after"
          title="Real results from our patients"
          description="Drag the slider to compare. Cases shared with patient consent; individual results vary."
          action={
            <Button asChild variant="outline">
              <Link href="/portfolio">
                See full portfolio
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <BeforeAfterGallery items={portfolio} dentistNames={dentistNames} limit={4} />
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Testimonials"
          title="What our patients say"
          action={
            <Button asChild variant="outline">
              <Link href="/testimonials">
                Read all reviews
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </Section>

      <Section muted>
        <SectionHeader
          eyebrow="Inside SmileCare"
          title="A modern clinic, designed for comfort"
          action={
            <Button asChild variant="outline">
              <Link href="/gallery">
                Open gallery
                <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <GalleryGrid items={gallery} filterable={false} limit={6} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader
            eyebrow="FAQs"
            title="Answers to common questions"
            description="Can't find what you're looking for? Our front desk is happy to help."
            action={
              <Button asChild variant="outline" className="w-fit">
                <Link href="/faqs">
                  All FAQs
                  <ArrowRight />
                </Link>
              </Button>
            }
            className="md:flex-col md:items-start md:justify-start"
          />
          <FaqList faqs={faqs.slice(0, 6)} withCategories={false} />
        </div>
      </Section>

      <CtaBand title={content.cta.title} subtitle={content.cta.subtitle} button={content.cta.button} phone={settings.phone} />
    </>
  );
}
