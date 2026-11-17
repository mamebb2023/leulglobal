import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CategoryTable } from "./CategoryTable";
import { OutOfDateBanner } from "./DataBanner";
import { PriceChart } from "./PriceChart";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { thin } from "@/lib/chart";
import { statusLabel, worstStatus } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/page-icons";
import { getHistory, getQuotes } from "@/lib/quotes";
import { CATEGORIES, byCategory, type CategoryId } from "@/lib/registry";

export type CategorySearchParams = Promise<{
  i?: string | string[] | undefined;
}>;

export function CategoryPageContent({
  category,
  searchParams,
}: {
  category: CategoryId;
  searchParams: CategorySearchParams;
}) {
  const config = CATEGORIES[category];
  const count = byCategory(category).length;
  const Icon = CATEGORY_ICONS[category];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="flex items-start gap-3 sm:gap-4">
        {/* One icon per page, the same one the sidebar uses for this category. */}
        <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20 sm:size-12">
          <Icon className="size-5 sm:size-6" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">
            Category
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
              {config.label}
            </h1>

            {/* One cadence indicator for the whole page: these instruments are
                fetched together, so repeating it per row only crowds the names. */}
            <Suspense fallback={<StatusSkeleton />}>
              <CategoryStatus category={category} />
            </Suspense>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} instrument{count === 1 ? "" : "s"} tracked
          </p>
        </div>
      </header>

      <Suspense fallback={<CategorySkeleton />}>
        <CategoryBody category={category} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryStatus({ category }: { category: CategoryId }) {
  await connection();
  const quotes = await getQuotes(category);
  if (quotes.length === 0) return null;

  // Status is the worst row; the time is the latest observation, so one
  // lagging instrument cannot make the section look older than its freshest
  // price.
  const asOf =
    quotes
      .map((q) => q.asOf)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

  const status = worstStatus(quotes.map((q) => q.status));
  const { cadence } = CATEGORIES[category];

  return (
    <StatusBadge status={status} label={statusLabel(status, cadence, asOf)} />
  );
}

async function CategoryBody({
  category,
  searchParams,
}: {
  category: CategoryId;
  searchParams: CategorySearchParams;
}) {
  // Prices must be read per request, never baked into the static shell.
  await connection();

  const [quotes, params] = await Promise.all([
    getQuotes(category),
    searchParams,
  ]);

  const requested = Array.isArray(params.i) ? params.i[0] : params.i;
  const selected =
    quotes.find((q) => q.instrumentId === requested) ?? quotes[0];

  const points = selected
    ? thin(await getHistory(selected.instrumentId, 7), 240)
    : [];

  return (
    <>
      <OutOfDateBanner quotes={quotes} />

      {selected && (
        <Card className="gap-3">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold text-primary">
              {selected.label}
              <span className="ml-1.5 font-normal text-muted-foreground">
                · last 7 days
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{selected.unit}</p>
          </CardHeader>
          <CardContent>
            <PriceChart
              label={selected.label}
              points={points}
              unit={selected.unit}
              decimals={selected.decimals}
            />
          </CardContent>
        </Card>
      )}

      {quotes.length > 1 && (
        <nav aria-label="Choose instrument" className="-mx-1 overflow-x-auto">
          <ul className="flex gap-1.5 px-1 py-0.5">
            {quotes.map((q) => {
              const active = q.instrumentId === selected?.instrumentId;
              return (
                <li key={q.instrumentId}>
                  <Link
                    href={`?i=${encodeURIComponent(q.instrumentId)}`}
                    aria-current={active ? "true" : undefined}
                    scroll={false}
                    className={`inline-flex min-h-8 items-center rounded-full px-2.5 text-[11px] font-semibold ring-1 transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-card text-muted-foreground ring-foreground/10 hover:text-foreground"
                    }`}
                  >
                    {q.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <CategoryTable category={category} quotes={quotes} />
    </>
  );
}

function StatusSkeleton() {
  return (
    <div
      aria-hidden
      className="h-6 w-36 animate-pulse rounded-md bg-muted/60"
    />
  );
}

function CategorySkeleton() {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-56 animate-pulse rounded-xl bg-muted/60 ring-1 ring-foreground/10" />
      <div className="h-72 animate-pulse rounded-xl bg-muted/60 ring-1 ring-foreground/10" />
    </div>
  );
}
