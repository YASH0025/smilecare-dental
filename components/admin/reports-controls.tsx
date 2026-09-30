"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { startOfMonth, startOfYear, subMonths } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateKey } from "@/lib/utils";

const PRESETS = [
  { label: "This month", from: () => startOfMonth(new Date()) },
  { label: "Last 3 months", from: () => startOfMonth(subMonths(new Date(), 2)) },
  { label: "Last 6 months", from: () => startOfMonth(subMonths(new Date(), 5)) },
  { label: "This year", from: () => startOfYear(new Date()) },
];

/** Date-range controls: one row above the charts, applied via URL params. */
export function ReportsFilters({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [f, setF] = React.useState(from);
  const [t, setT] = React.useState(to);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setF(from);
    setT(to);
  }, [from, to]);

  const apply = (nf: string, nt: string) => {
    if (nf > nt) {
      toast.error("Start date must be before end date.");
      return;
    }
    startTransition(() => router.push(`${pathname}?from=${nf}&to=${nt}`));
  };
  const today = toDateKey(new Date());

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-[var(--shadow-soft)] lg:flex-row lg:items-end">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const pf = toDateKey(p.from());
          const active = pf === from && to === today;
          return (
            <Button key={p.label} size="sm" variant={active ? "default" : "outline"} onClick={() => apply(pf, today)} disabled={pending}>
              {p.label}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-end gap-2 lg:ml-auto">
        <div className="grid gap-1">
          <Label htmlFor="rep-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input id="rep-from" type="date" value={f} onChange={(e) => setF(e.target.value)} className="h-8 w-[150px]" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="rep-to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input id="rep-to" type="date" value={t} onChange={(e) => setT(e.target.value)} className="h-8 w-[150px]" />
        </div>
        <Button size="sm" onClick={() => apply(f, t)} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Apply
        </Button>
      </div>
    </div>
  );
}

export function ExportCsvButton({ rows, filename }: { rows: string[][]; filename: string }) {
  function download() {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported.");
  }
  return (
    <Button variant="outline" onClick={download}>
      <Download /> Export CSV
    </Button>
  );
}
