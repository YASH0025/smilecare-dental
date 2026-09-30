import type { Metadata } from "next";
import { PageHero, Section, SectionHeader } from "@/components/public/section";
import { FeatureGrid } from "@/components/public/feature-grid";
import { StatsBand } from "@/components/public/stats-band";
import { DentistCard } from "@/components/public/dentist-card";
import { CtaBand } from "@/components/public/cta-band";
import { SmartImage } from "@/components/shared/smart-image";
import { catalogService, settingsService, websiteContentService } from "@/lib/services";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SmileCare Dental Clinic in Indore — our story, specialist team, values and commitment to safe, patient-first dentistry.",
  openGraph: { title: "About SmileCare Dental Clinic", description: "Specialist-led, patient-first dentistry in Indore." },
};

export default async function AboutPage() {
  const [content, settings, dentists] = await Promise.all([
    websiteContentService.get(),
    settingsService.get(),
    catalogService.listDentists({ activeOnly: true }),
  ]);
  const { about } = content;

  return (
    <>
      <PageHero title={about.title} description={about.intro} crumbs={[{ label: "About" }]} />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[25/18] overflow-hidden rounded-2xl border bg-muted">
            <SmartImage src={about.image} alt="The SmileCare clinical team" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 text-[28px] font-semibold sm:text-[32px]">Built on trust, one smile at a time</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{about.story}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-canvas p-5">
                <h3 className="text-sm font-semibold">Our mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{about.mission}</p>
              </div>
              <div className="rounded-xl border bg-canvas p-5">
                <h3 className="text-sm font-semibold">Our vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{about.vision}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <StatsBand stats={content.stats} />

      <Section>
        <SectionHeader eyebrow="Our values" title="What guides every appointment" />
        <div className="mt-10">
          <FeatureGrid features={about.values} />
        </div>
      </Section>

      <Section muted>
        <SectionHeader eyebrow="Milestones" title="Our journey so far" />
        <ol className="relative mt-10 grid gap-6 md:grid-cols-4">
          {about.milestones.map((m) => (
            <li key={m.year} className="rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold text-primary">{m.year}</p>
              <h3 className="mt-2 font-semibold">{m.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeader eyebrow="The team" title="Meet our specialists" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dentists.map((d) => (
            <DentistCard key={d.id} dentist={d} />
          ))}
        </div>
      </Section>

      <CtaBand title={content.cta.title} subtitle={content.cta.subtitle} button={content.cta.button} phone={settings.phone} />
    </>
  );
}
