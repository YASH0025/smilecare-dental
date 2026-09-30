import Image, { type ImageProps } from "next/image";

const OPTIMIZED_HOSTS = ["images.unsplash.com", "images.pexels.com"];

/**
 * next/image wrapper that works with any CMS-provided image:
 * - local/remote SVGs and unknown hosts are served unoptimised (safe fallback)
 * - whitelisted photo hosts go through the Next.js optimiser
 */
export function SmartImage({ src, alt, ...props }: ImageProps & { src: string }) {
  const safeSrc = src || "/images/og-image.svg";
  let unoptimized = safeSrc.endsWith(".svg");
  if (/^https?:\/\//.test(safeSrc)) {
    try {
      unoptimized ||= !OPTIMIZED_HOSTS.includes(new URL(safeSrc).hostname);
    } catch {
      unoptimized = true;
    }
  }
  return <Image src={safeSrc} alt={alt} unoptimized={unoptimized} {...props} />;
}
