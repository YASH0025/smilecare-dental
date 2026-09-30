"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-lg border shadow-[var(--shadow-lift)] font-sans text-sm",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
