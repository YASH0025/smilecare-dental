import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Section } from "@/components/public/section";
import { FaqList } from "@/components/public/faq-list";
import { faqService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about appointments, treatments, payments and safety at SmileCare Dental Clinic, Indore.",
  openGraph: { title: "FAQs | SmileCare", description: "Common questions about dental care at SmileCare." },
};

export default async function FaqsPage() {
  const faqs = await faqService.list((f) => f.published);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero title="Frequently asked questions" description="Everything you need to know before your visit." crumbs={[{ label: "FAQs" }]} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-xl border bg-canvas p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-5 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Still have a question?</p>
                <p className="text-sm text-muted-foreground">Our front desk replies within one working day.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
