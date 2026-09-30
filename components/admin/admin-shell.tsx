"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * Admin chrome. Desktop: fixed sidebar. Tablet: sidebar starts collapsed (icon rail).
 * Mobile: sidebar hidden, drawer navigation from the top bar.
 */
export function AdminShell({ children, user, clinicName }: { children: React.ReactNode; user: { name: string; email: string }; clinicName: string }) {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1199px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} clinicName={clinicName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
