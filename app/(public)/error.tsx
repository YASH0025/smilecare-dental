"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[50vh] place-items-center py-20">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">We couldn&apos;t load this page. Please try again, or call the clinic if the problem continues.</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
      </div>
    </div>
  );
}
