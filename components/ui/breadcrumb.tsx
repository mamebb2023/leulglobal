"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

/** Readable names for the app's routes; anything else falls back to title case. */
const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  gold: "Gold",
  crypto: "Crypto",
  fx: "FX Rates",
  commodities: "Commodities",
};

const formatSegment = (segment: string) =>
  LABELS[segment] ??
  segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function Breadcrumbs({
  homeHref = "/dashboard",
  className,
}: {
  homeHref?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    segment,
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <Button
        nativeButton={false}
        render={<Link href={homeHref} aria-label="Dashboard home" />}
        variant="ghost"
        size="icon-sm"
        className="-ml-1.5 text-primary hover:bg-transparent hover:text-primary/80"
      >
        <Home size={16} aria-hidden />
      </Button>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <Fragment key={crumb.href}>
            <ChevronRight
              size={14}
              className="shrink-0 text-muted-foreground/60"
              aria-hidden
            />

            {isLast ? (
              <span
                aria-current="page"
                className="font-semibold tracking-tight text-foreground"
              >
                {formatSegment(crumb.segment)}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {formatSegment(crumb.segment)}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
