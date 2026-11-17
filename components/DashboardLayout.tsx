"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, LogOut, Menu, Settings, Star, X } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import Sidebar, { isActive, type NavItem } from "@/components/Sidebar";

const BOTTOM_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-primary lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-primary shadow-xl transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-2 top-2 h-11 w-11 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X />
          </Button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-primary px-4 text-primary-foreground sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="-ml-2 h-11 w-11 text-white hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu />
            </Button>
            <span className="text-sm font-bold tracking-wider text-secondary">
              MARKET OVERVIEW
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" aria-hidden />
              <span className="hidden sm:inline">PRIVATE ACCOUNT</span>
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                className="h-11 w-11 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <LogOut aria-hidden />
              </Button>
            </form>
          </div>
        </header>

        {/* Page content (extra bottom padding on mobile for the bottom nav) */}
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-primary pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                    active ? "text-secondary" : "text-white/70"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
