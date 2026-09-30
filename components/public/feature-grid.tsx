import type { Feature } from "@/types";
import { FeatureIcon } from "@/components/shared/icon";

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="bg-white p-6 sm:p-7">
          <div className="grid size-10 place-items-center rounded-lg bg-accent text-primary">
            <FeatureIcon name={f.icon} className="size-5" />
          </div>
          <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
