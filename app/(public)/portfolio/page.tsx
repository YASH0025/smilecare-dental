import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/section";
import { BeforeAfterGallery } from "@/components/public/before-after";
import { EmptyState } from "@/components/shared/empty-state";
import { catalogService, portfolioService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Smile Portfolio — Before & After",
  description: "Before and after results from SmileCare patients: implants, aligners, whitening, veneers and full smile makeovers.",
  openGraph: { title: "Before & After | SmileCare", description: "Real patient results from SmileCare Dental Clinic." },
};

export default async function PortfolioPage() {
  const [items, dentists] = await Promise.all([portfolioService.list((p) => p.published), catalogService.listDentists()]);
  const names = Object.fromEntries(dentists.map((d) => [d.id, d.name]));
  return (
    <>
      <PageHero
        title="Smile portfolio"
        description="Drag the slider on each case to compare before and after. All cases are shared with patient consent; results vary between individuals."
        crumbs={[{ label: "Portfolio" }]}
      />
      <Section>
        {items.length ? <BeforeAfterGallery items={items} dentistNames={names} /> : <EmptyState title="No cases published yet" description="Please check back soon." />}
      </Section>
    </>
  );
}
