import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "blue" | "teal" | "amber" | "gray" | "green" | "red";
}) {
  const tones = {
    blue: "bg-accent text-primary",
    teal: "bg-teal-soft text-teal",
    amber: "bg-[var(--status-noshow-bg)] text-[var(--status-noshow)]",
    gray: "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
    green: "bg-[var(--status-completed-bg)] text-[var(--status-completed)]",
    red: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled)]",
  };
  const body = (
    <div className="flex h-full items-start justify-between gap-3 rounded-xl border bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tones[tone])}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}
