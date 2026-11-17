import { Suspense } from "react";
import { connection } from "next/server";
import { Moon, Sun, Sunrise } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { OutOfDateBanner } from "@/components/dashboard/DataBanner";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { thin } from "@/lib/chart";
import { getHistory, getQuotes } from "@/lib/quotes";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/registry";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <Suspense fallback={<GreetingSkeleton />}>
            <Greeting />
          </Suspense>
          <p className="mt-1 text-sm text-muted-foreground">
            Your market overview
          </p>
        </div>

        <Suspense fallback={null}>
          <RefreshControl />
        </Suspense>
      </section>

      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>

      {/* Chart + news */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-primary">
              Market watch · BTC / USDT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <BtcChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-primary">
              Latest market news
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-foreground">
              News feed is not enabled
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This dashboard only shows prices it can source and timestamp.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function Greeting() {
  // The shell is prerendered, so a bare Date() here would freeze at build
  // time. Resolve it per request, in the same timezone the prices print in.
  await connection();

  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Africa/Addis_Ababa",
    }).format(new Date()),
  );

  const { text, Icon } =
    hour >= 5 && hour < 12
      ? { text: "Good morning", Icon: Sunrise }
      : hour >= 12 && hour < 18
        ? { text: "Good afternoon", Icon: Sun }
        : { text: "Good evening", Icon: Moon };

  return (
    <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
      <Icon
        className="h-7 w-7 shrink-0 text-secondary sm:h-8 sm:w-8"
        aria-hidden
      />
      {text}
    </h1>
  );
}

function GreetingSkeleton() {
  return (
    <div
      aria-hidden
      className="h-8 w-52 animate-pulse rounded-md bg-muted/60"
    />
  );
}

async function RefreshControl() {
  await connection();
  // Refreshing generated data is meaningless, so the control is hidden there.
  if (process.env.DATA_MODE === "mock") return null;
  return <RefreshButton />;
}

async function Overview() {
  // Prices must be read per request, never baked into the static shell.
  await connection();
  const quotes = await Promise.all(CATEGORY_IDS.map((c) => getQuotes(c)));

  return (
    <section aria-label="Key markets" className="space-y-4">
      <OutOfDateBanner quotes={quotes.flat()} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_IDS.map((id, i) => (
          <CategoryCard
            key={id}
            category={CATEGORIES[id]}
            quotes={quotes[i]}
          />
        ))}
      </div>
    </section>
  );
}

async function BtcChart() {
  await connection();
  const points = thin(await getHistory("BTCUSDT", 7), 240);

  return (
    <PriceChart
      label="BTC / USDT"
      points={points}
      unit="USDT"
      decimals={2}
    />
  );
}

function ChartSkeleton() {
  return (
    <div
      aria-hidden
      className="h-44 animate-pulse rounded-lg bg-muted/60"
    />
  );
}

function OverviewSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {CATEGORY_IDS.map((id) => (
        <div
          key={id}
          className="h-56 animate-pulse rounded-xl bg-muted/60 ring-1 ring-foreground/10"
        />
      ))}
    </div>
  );
}
