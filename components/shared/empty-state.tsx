import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-12 place-items-center rounded-xl border bg-canvas text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
