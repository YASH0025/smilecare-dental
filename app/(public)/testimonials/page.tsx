import type { Metadata } from "next";
import { PageHero, Section } from "@/components/public/section";
import { TestimonialCard } from "@/components/public/testimonial-card";
import { Rating } from "@/components/shared/rating";
import { testimonialService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Patient Testimonials",
  description: "Read reviews from SmileCare patients about implants, root canals, aligners, whitening and more.",
  openGraph: { title: "Patient Reviews | SmileCare", description: "What our patients say about SmileCare Dental Clinic." },
};

export default async function TestimonialsPage() {
  const items = await testimonialService.list((t) => t.status === "APPROVED");
  const avg = items.length ? items.reduce((s, t) => s + t.rating, 0) / items.length : 0;
  return (
    <>
      <PageHero title="Patient stories" description="Honest words from people who trusted us with their smiles." crumbs={[{ label: "Testimonials" }]}>
        {items.length > 0 && (
          <div className="mt-6 inline-flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
            <span className="text-2xl font-semibold">{avg.toFixed(1)}</span>
            <div>
              <Rating value={Math.round(avg)} />
              <p className="text-xs text-muted-foreground">{items.length} verified reviews</p>
            </div>
          </div>
        )}
      </PageHero>
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </Section>
    </>
  );
}
