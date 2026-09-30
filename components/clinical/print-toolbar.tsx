"use client";

import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintToolbar({ label }: { label: string }) {
  return (
    <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.close()}>
          <X /> Close
        </Button>
        <Button onClick={() => window.print()}>
          <Printer /> Print
        </Button>
      </div>
    </div>
  );
}
