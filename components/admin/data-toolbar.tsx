import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Filter row that sits above every admin data table. */
export function DataToolbar({
  search,
  onSearch,
  placeholder = "Search…",
  children,
  className,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center", className)}>
      <div className="relative lg:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function TableCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-soft)]", className)}>{children}</div>;
}
