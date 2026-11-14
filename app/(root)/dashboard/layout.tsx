"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Menu, Settings, Star, X } from "lucide-react";
import Sidebar, { isActive, type NavItem } from "@/components/Sidebar";

const BOTTOM_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/* ---------- Layout ---------- */
export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on route change
  //   useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-[#14243A] lg:block">
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
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-[#14243A] shadow-xl transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#14243A] px-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold tracking-wider text-[#C8A34D]">
              MARKET OVERVIEW
            </span>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-[#C8A34D]">
            <span className="h-2 w-2 rounded-full bg-[#C8A34D]" aria-hidden />
            <span className="hidden sm:inline">PRIVATE ACCOUNT</span>
          </span>
        </header>

        {/* Page content (extra bottom padding on mobile for the bottom nav) */}
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#14243A] pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                    active ? "text-[#C8A34D]" : "text-white/70"
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
