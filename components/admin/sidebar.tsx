"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5 px-3 py-4">
      {ADMIN_NAV.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.label && !collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">{group.label}</p>
          )}
          {group.label && collapsed && <div className="mx-2.5 mb-1.5 h-px bg-sidebar-border" aria-hidden />}
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const link = (
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-9 items-center gap-3 rounded-md px-2.5 text-[13.5px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
                  active && "bg-sidebar-accent text-primary hover:text-primary",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && <span className="sr-only">{item.label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle, clinicName }: { collapsed: boolean; onToggle: () => void; clinicName: string }) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold">SmileCare</span>
              <span className="block truncate text-[11px] text-muted-foreground">{clinicName}</span>
            </span>
          )}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("flex items-center gap-1 border-t border-sidebar-border p-3", collapsed ? "flex-col" : "justify-between")}>
        <Link
          href="/"
          target="_blank"
          className={cn("flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground")}
          aria-label="View website"
        >
          <ExternalLink className="size-4" aria-hidden />
          {!collapsed && "View website"}
        </Link>
        <button
          onClick={onToggle}
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
