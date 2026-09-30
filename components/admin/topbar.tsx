"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, CheckCheck, LogOut, Menu, Plus, Search, Globe } from "lucide-react";
import type { AppNotification } from "@/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { useLogout, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { cn, initials } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";
import { SidebarNav } from "./sidebar";

export function Topbar({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await logoutMutation.mutateAsync().catch(() => undefined);
    queryClient.clear(); // drop cached patient data on sign-out
    router.replace("/admin/login");
    router.refresh();
  }

  const go = (href: string) => {
    setCmdOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>

      <button
        onClick={() => setCmdOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-canvas px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="hidden rounded border bg-white px-1.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/admin/appointments?new=1">
            <Plus />
            New appointment
          </Link>
        </Button>
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none" aria-label="Account menu">
              <Avatar className="size-8">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium text-foreground">{user.name}</span>
              <span className="block text-xs">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Clinic settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank">
                <Globe /> View website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} variant="destructive">
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile drawer navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] gap-0 p-0">
          <SheetHeader className="h-16 justify-center border-b px-4 py-0">
            <SheetTitle asChild>
              <div>
                <Logo href="/admin/dashboard" />
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Type a page or action…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => go("/admin/appointments?new=1")}>
              <Plus /> New appointment
            </CommandItem>
            <CommandItem onSelect={() => go("/admin/patients?new=1")}>
              <Plus /> New patient
            </CommandItem>
            <CommandItem onSelect={() => go("/admin/billing?new=1")}>
              <Plus /> New invoice
            </CommandItem>
          </CommandGroup>
          {ADMIN_NAV.map((g, i) => (
            <CommandGroup key={i} heading={g.label ?? (i === 0 ? "Overview" : "General")}>
              {g.items.map((item) => (
                <CommandItem key={item.href} onSelect={() => go(item.href)}>
                  <item.icon /> {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}

function Notifications() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const notifications = useNotifications(); // polls every 30s
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const items = notifications.data ?? (notifications.isError ? [] : null);
  const { refetch } = notifications;

  React.useEffect(() => {
    if (open) void refetch();
  }, [open, refetch]);

  const unread = items?.filter((n) => !n.read).length ?? 0;

  function markAll() {
    markAllRead.mutate();
  }

  function openItem(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={!unread}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        <ul className="max-h-[380px] overflow-y-auto">
          {items === null && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</li>}
          {items?.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>}
          {items?.map((n) => (
            <li key={n.id}>
              <button onClick={() => openItem(n)} className={cn("flex w-full gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted/60", !n.read && "bg-accent/40")}>
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.message}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground/80">
                    {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })} · {n.channels.join(" · ").toLowerCase().replace(/_/g, " ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t px-4 py-2.5 text-[11px] text-muted-foreground">Email/SMS/WhatsApp delivery is simulated in this demo.</p>
      </PopoverContent>
    </Popover>
  );
}
