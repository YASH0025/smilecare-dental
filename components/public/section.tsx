import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-[28px] leading-tight font-semibold text-balance sm:text-[34px]">{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-pretty text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ children, className, muted, id }: { children: React.ReactNode; className?: string; muted?: boolean; id?: string }) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", muted && "bg-canvas", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Header band used at the top of inner public pages. */
export function PageHero({
  title,
  description,
  crumbs,
  children,
}: {
  title: string;
  description?: string;
  crumbs: { href?: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b bg-canvas">
      <div className="container-page py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden />
                {c.href ? (
                  <Link href={c.href} className="hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-3xl text-[32px] leading-tight font-semibold text-balance sm:text-[42px]">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
        {children}
      </div>
    </section>
  );
}
