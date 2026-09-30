import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Siren } from "lucide-react";
import { PageHero, Section } from "@/components/public/section";
import { ContactForm } from "@/components/forms/contact-form";
import { catalogService, settingsService, websiteContentService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact SmileCare Dental Clinic in New Palasia, Indore. Call, email or send us a message — we reply within one working day.",
  openGraph: { title: "Contact SmileCare", description: "Get in touch with SmileCare Dental Clinic, Indore." },
};

export default async function ContactPage() {
  const [settings, content, services] = await Promise.all([
    settingsService.get(),
    websiteContentService.get(),
    catalogService.listServices({ publishedOnly: true }),
  ]);

  const items = [
    { Icon: MapPin, label: "Visit us", value: settings.address, href: settings.googleMapsUrl },
    { Icon: Phone, label: "Call", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { Icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { Icon: Siren, label: "Emergency", value: settings.emergencyContact, href: `tel:${settings.emergencyContact.replace(/\s/g, "")}` },
  ];

  return (
    <>
      <PageHero title={content.contact.title} description={content.contact.subtitle} crumbs={[{ label: "Contact" }]} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {items.map(({ Icon, label, value, href }) => (
                <li key={label}>
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-4 rounded-xl border bg-white p-4 transition-colors hover:border-primary/30">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs text-muted-foreground">{label}</span>
                      <span className="mt-0.5 block text-sm font-medium">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="size-4 text-primary" aria-hidden /> Opening hours
              </h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                {settings.openingHours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{h.label}</dt>
                    <dd className="font-medium">{h.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <ContactForm services={services.map((s) => s.name)} />
        </div>
        {settings.googleMapsEmbedUrl && (
          <div className="mt-12 overflow-hidden rounded-xl border">
            <iframe
              title={`Map showing ${settings.name}`}
              src={settings.googleMapsEmbedUrl}
              className="h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </Section>
    </>
  );
}
