import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { catalogService, settingsService } from "@/lib/services";

// Content is edited at runtime through the CMS, so render on every request.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([settingsService.get(), catalogService.listServices({ publishedOnly: true })]);
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader logoText={settings.logoText} phone={settings.phone} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} services={services} />
    </div>
  );
}
