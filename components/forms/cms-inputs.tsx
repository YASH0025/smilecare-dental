"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Image field for the CMS. Accepts an absolute URL or a site path (/images/...).
 * Uploading to object storage is intentionally out of scope for the JSON version.
 */
export function ImageInput({ value, onChange, id, aspect = "aspect-[4/3]", className }: { value: string; onChange: (v: string) => void; id?: string; aspect?: string; className?: string }) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => setBroken(false), [value]);
  return (
    <div className={cn("flex gap-3", className)}>
      <div className={cn("relative w-24 shrink-0 overflow-hidden rounded-md border bg-muted", aspect)}>
        {value && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-muted-foreground">
            <ImageOff className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or https://…" />
        <p className="text-xs text-muted-foreground">Paste an image URL (e.g. Unsplash) or a path under /public.</p>
      </div>
    </div>
  );
}

/** Edits a string[] as one item per line. */
export function LinesInput({ value, onChange, rows = 4, placeholder, id }: { value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string; id?: string }) {
  const [text, setText] = React.useState(value.join("\n"));
  const last = React.useRef(value);
  React.useEffect(() => {
    if (value !== last.current && value.join("\n") !== text.split("\n").filter(Boolean).join("\n")) setText(value.join("\n"));
    last.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        );
      }}
      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-[0_1px_1px_rgba(11,27,52,0.03)] outline-none placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
    />
  );
}
