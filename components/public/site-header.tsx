"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader({ logoText, phone }: { logoText: string; phone: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md transition-[border-color,box-shadow]",
        scrolled ? "border-border shadow-[0_1px_0_rgba(11,27,52,0.02),0_6px_20px_-12px_rgba(11,27,52,0.15)]" : "border-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo text={logoText} />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted xl:flex"
          >
            <Phone className="size-4 text-primary" aria-hidden />
            {phone}
          </a>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/book-appointment">
              <CalendarPlus />
              Book Appointment
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm">
              <SheetHeader className="border-b">
                <SheetTitle asChild>
                  <div>
                    <Logo text={logoText} />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-3">
                {PUBLIC_NAV.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        isActive(item.href) && "bg-accent text-accent-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t p-5">
                <SheetClose asChild>
                  <Button asChild size="lg">
                    <Link href="/book-appointment">
                      <CalendarPlus />
                      Book Appointment
                    </Link>
                  </Button>
                </SheetClose>
                <Button asChild variant="outline" size="lg">
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>
                    <Phone />
                    Call {phone}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
