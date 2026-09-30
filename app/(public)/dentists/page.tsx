import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/section";
import { DentistCard } from "@/components/public/dentist-card";
import { catalogService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Our Dentists",
  description: "Meet SmileCare's MDS-qualified specialists in implantology, endodontics and orthodontics in Indore.",
  openGraph: { title: "Our Dentists | SmileCare", description: "Specialist dentists in Indore." },
};

export default async function DentistsPage() {
  const dentists = await catalogService.listDentists({ activeOnly: true });
  return (
    <>
      <PageHero
        title="Specialists who care"
        description="Our dentists are MDS-qualified specialists who collaborate on every complex case, so you always get the right expertise."
        crumbs={[{ label: "Dentists" }]}
      />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dentists.map((d) => (
            <DentistCard key={d.id} dentist={d} />
          ))}
        </div>
      </Section>
    </>
  );
}
