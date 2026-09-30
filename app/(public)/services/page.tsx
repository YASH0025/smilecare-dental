import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/section";
import { ServiceCard } from "@/components/public/service-card";
import { catalogService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Dental Services",
  description: "Explore dental treatments at SmileCare, Indore: implants, root canal, clear aligners, whitening, veneers, children's dentistry and more.",
  openGraph: { title: "Dental Services | SmileCare", description: "Specialist dental treatments in Indore with transparent pricing." },
};

export default async function ServicesPage() {
  const services = await catalogService.listServices({ publishedOnly: true });
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <>
      <PageHero
        title="Dental services"
        description="Specialist-led treatments with transparent starting prices. Final costs are confirmed in writing after your consultation."
        crumbs={[{ label: "Services" }]}
      >
        <nav aria-label="Service categories" className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a key={c} href={`#${c.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              {c}
            </a>
          ))}
        </nav>
      </PageHero>
      <Section>
        <div className="space-y-16">
          {categories.map((c) => (
            <div key={c} id={c.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
              <h2 className="text-xl font-semibold">{c}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => s.category === c)
                  .map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
