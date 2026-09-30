"use client";

import * as React from "react";
import type { Faq } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function FaqList({ faqs, withCategories = true }: { faqs: Pick<Faq, "id" | "question" | "answer" | "category">[]; withCategories?: boolean }) {
  const categories = React.useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
  const [active, setActive] = React.useState("All");
  const visible = faqs.filter((f) => active === "All" || f.category === active);

  return (
    <div>
      {withCategories && categories.length > 2 && (
        <div role="tablist" aria-label="FAQ categories" className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
                active === c ? "border-primary bg-primary text-white" : "bg-white text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <Accordion type="single" collapsible className="rounded-xl border bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
        {visible.map((f) => (
          <AccordionItem key={f.id} value={f.id}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
