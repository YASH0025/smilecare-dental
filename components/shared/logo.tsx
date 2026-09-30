import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-8 place-items-center rounded-lg bg-primary text-white shadow-sm", className)} aria-hidden>
      <svg viewBox="0 0 64 64" className="size-5" fill="currentColor">
        <path d="M14 20c0-7 9-10 18-5 9-5 18-2 18 5 0 10-4 14-4 22 0 7-2 14-6 14s-4-11-8-11-4 11-8 11-6-7-6-14c0-8-4-12-4-22z" />
      </svg>
    </span>
  );
}

export function Logo({ text = "SmileCare", href = "/", className }: { text?: string; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">{text}</span>
    </Link>
  );
}
