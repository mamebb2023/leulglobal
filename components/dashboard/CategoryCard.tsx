import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmtUpdated, statusLabel, worstStatus } from "@/lib/format";
import type { CategoryConfig } from "@/lib/registry";
import type { Quote } from "@/lib/types";
import { PriceRow } from "./PriceRow";
import { StatusBadge } from "./StatusBadge";

export function CategoryCard({
  category,
  quotes,
}: {
  category: CategoryConfig;
  quotes: Quote[];
}) {
  const shown = category.overviewIds
    .map((id) => quotes.find((q) => q.instrumentId === id))
    .filter((q): q is Quote => Boolean(q));

  // A section can mix sources (gold spot vs COMEX futures), so never attribute
  // the card to one source or to the freshest row alone.
  const sources = [
    ...new Set(
      shown
        .map((q) => q.source)
        .filter((s): s is string => Boolean(s)),
    ),
  ];
  // One timestamp per card: the most recent arrival. Status still uses the
  // worst row, so a stale row cannot hide behind a fresh one.
  const latest = shown
    .map((q) => q.asOf)
    .filter((s): s is string => Boolean(s))
    .sort()
    .at(-1);

  const status =
    shown.length > 0
      ? worstStatus(shown.map((q) => q.status))
      : ("unavailable" as const);

  return (
    <Card className="py-4 gap-3">
      <CardHeader className="px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {category.label}
          </CardTitle>
          <StatusBadge
            status={status}
            label={statusLabel(status, category.cadence, latest ?? null)}
          />
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <ul className="divide-y">
          {shown.map((q) => (
            <PriceRow key={q.instrumentId} quote={q} />
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 text-[11px] text-muted-foreground">
        <span className="min-w-0">
          {sources.length > 0 ? sources.join(" · ") : "No source yet"}
          <span aria-hidden> · </span>
          {latest ? fmtUpdated(latest) : "No update yet"}
        </span>
        <Link
          href={category.href}
          className="inline-flex min-h-8 items-center gap-0.5 font-semibold text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
