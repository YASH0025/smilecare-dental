"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md rounded-xl border bg-white p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">This page couldn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">A data or network error occurred. Your data has not been changed.</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw />
          Retry
        </Button>
      </div>
    </div>
  );
}
