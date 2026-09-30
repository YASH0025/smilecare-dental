import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SmileCare Dental Clinic — Healthy Smile. Confident You.",
    template: "%s | SmileCare Dental Clinic, Indore",
  },
  description:
    "Specialist-led dental clinic in Indore offering implants, root canals, clear aligners, whitening and family dentistry. Book your appointment online.",
  applicationName: "SmileCare",
  openGraph: {
    type: "website",
    siteName: "SmileCare Dental Clinic",
    locale: "en_IN",
    images: [{ url: "/images/og-image.svg", width: 1200, height: 630, alt: "SmileCare Dental Clinic" }],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="min-h-dvh font-sans">
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
