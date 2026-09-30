import Link from "next/link";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import type { ClinicSettings, Service } from "@/types";
import { Logo } from "@/components/shared/logo";
import { PUBLIC_NAV } from "@/lib/constants";

export function SiteFooter({ settings, services }: { settings: ClinicSettings; services: Service[] }) {
  const socials = [
    { href: settings.social.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.social.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.social.youtube, label: "YouTube", Icon: Youtube },
    { href: settings.social.linkedin, label: "LinkedIn", Icon: Linkedin },
  ].filter((s) => s.href);

  return (
    <footer className="border-t bg-canvas">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-4">
          <Logo text={settings.logoText} />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings.name} — {settings.tagline} Specialist-led dental care for families in {settings.city}.
          </p>
          <div className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-md border bg-white text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Quick links</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/testimonials" className="text-muted-foreground hover:text-foreground">
                Testimonials
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Services</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link href={`/services/${s.slug}`} className="text-muted-foreground hover:text-foreground">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-primary" aria-hidden /> Opening hours
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {settings.openingHours.map((h) => (
                <div key={h.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{h.label}</dt>
                  <dd className="font-medium text-right">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <p>
            Emergency: <a href={`tel:${settings.emergencyContact.replace(/\s/g, "")}`} className="font-medium text-foreground">{settings.emergencyContact}</a>
            <span className="mx-2">·</span>
            <Link href="/admin/login" className="hover:text-foreground">
              Staff login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
