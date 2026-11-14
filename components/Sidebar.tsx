"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bitcoin,
  Coins,
  DollarSign,
  Droplets,
  LayoutGrid,
  Newspaper,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Gold", href: "/dashboard/gold", icon: Coins },
  { label: "Crypto", href: "/dashboard/crypto", icon: Bitcoin },
  { label: "FX Rates", href: "/dashboard/fx", icon: DollarSign },
  { label: "Commodities", href: "/dashboard/commodities", icon: Droplets },
  { label: "Market News", href: "/dashboard/news", icon: Newspaper },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center px-5"
      >
        <span className="text-lg font-bold tracking-wide text-white">
          LEULGLOBAL
        </span>
        <span className="text-xs font-semibold text-[#C8A34D]">.COM</span>
      </Link>

      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A34D] ${
                  active
                    ? "bg-white/10 text-[#C8A34D]"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="px-5 py-4 text-[11px] text-white/50">
        Private account • Design concept
      </p>
    </nav>
  );
}
