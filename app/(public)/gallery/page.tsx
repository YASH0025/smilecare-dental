import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/section";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { galleryService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Clinic Gallery",
  description: "Take a look inside SmileCare Dental Clinic — our treatment rooms, technology, team and community events in Indore.",
  openGraph: { title: "Gallery | SmileCare", description: "Inside SmileCare Dental Clinic, Indore." },
};

export default async function GalleryPage() {
  const items = await galleryService.list((g) => g.published);
  return (
    <>
      <PageHero title="Inside SmileCare" description="Our clinic, our technology and the people who make every visit comfortable." crumbs={[{ label: "Gallery" }]} />
      <Section>
        <GalleryGrid items={items} />
      </Section>
    </>
  );
}
