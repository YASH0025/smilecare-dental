import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= value ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} aria-hidden />
      ))}
    </div>
  );
}
