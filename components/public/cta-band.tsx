import Link from "next/link";
import { CalendarPlus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand({ title, subtitle, button, phone }: { title: string; subtitle: string; button: string; phone: string }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-[#0f2a5c] px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -left-10 size-64 rounded-full bg-teal/25 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-[28px] leading-tight font-semibold text-balance sm:text-[36px]">{title}</h2>
              <p className="mt-3 text-base text-white/75 sm:text-lg">{subtitle}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="bg-white text-[#0f2a5c] hover:bg-white/90">
                <Link href="/book-appointment">
                  <CalendarPlus />
                  {button}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href={`tel:${phone.replace(/\s/g, "")}`}>
                  <Phone />
                  {phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
