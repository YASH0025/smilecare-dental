import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";
import { formatCurrency } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
      <Link href={`/services/${service.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted" tabIndex={-1} aria-hidden>
        <SmartImage
          src={service.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">{service.category}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-semibold">
          <Link href={`/services/${service.slug}`} className="hover:text-primary focus-visible:outline-none focus-visible:underline">
            {service.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
        <div className="mt-4 flex items-center gap-4 text-[13px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            {service.duration} min
          </span>
          <span className="text-muted-foreground">
            From <span className="font-semibold text-foreground">{formatCurrency(service.price)}</span>
          </span>
        </div>
        <div className="mt-5 flex gap-2 border-t pt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/services/${service.slug}`}>
              View details
              <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/book-appointment?service=${service.id}`}>Book appointment</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
