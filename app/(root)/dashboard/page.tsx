import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/* TEMPORARY SAMPLE DATA. Replace with real provider data later.       */
/* ------------------------------------------------------------------ */
const GOLD = { price: "$2,345.60", unit: "per troy oz", change: 0.82 };
const BITCOIN = { price: "$67,420.00", unit: "BTC / USD", change: -1.35 };
const USD_ETB = { price: "121.50", unit: "ETB per USD", change: 0.1 };
const COMMODITIES = [
  { name: "Brent", price: "$82.40", change: 0.6 },
  { name: "WTI", price: "$78.10", change: -0.4 },
  { name: "Copper", price: "$4.12", change: 1.1 },
];
const NEWS = [
  {
    headline: "Gold edges higher as the dollar softens",
    source: "Sample Wire",
    time: "10:42",
  },
  {
    headline: "Bitcoin slips after a volatile session",
    source: "Sample Wire",
    time: "09:15",
  },
  {
    headline: "Oil steadies on supply outlook",
    source: "Sample Wire",
    time: "08:30",
  },
];

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
        up ? "bg-up/10 text-up" : "bg-down/10 text-down"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
      )}
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function PriceCard({
  title,
  price,
  unit,
  change,
}: {
  title: string;
  price: string;
  unit: string;
  change: number;
}) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-extrabold tabular-nums text-primary">
          {price}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{unit}</p>
      </CardContent>
      <CardFooter className="mt-auto justify-between border-t px-4 pt-3 text-xs text-muted-foreground">
        <Change value={change} />
        <span>Sample • 24h</span>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting + data status */}
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
          Good day
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your market overview
        </p>
        <p className="mt-3 inline-block rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Data status:{" "}
          <span className="text-secondary">sample values, not live</span>
        </p>
      </section>

      {/* Key price cards */}
      <section
        aria-label="Key markets"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <PriceCard title="Gold" {...GOLD} />
        <PriceCard title="Bitcoin" {...BITCOIN} />
        <PriceCard title="USD / ETB" {...USD_ETB} />

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Oil &amp; Commodities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="space-y-2">
              {COMMODITIES.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-primary">
                      {c.price}
                    </span>
                    <Change value={c.change} />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t px-4 pt-3 text-xs text-muted-foreground">
            Sample • per unit
          </CardFooter>
        </Card>
      </section>

      {/* Chart + news */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-primary">
              Market watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-sm text-muted-foreground sm:h-72">
              Price history chart / selected watchlist
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-primary">
              Latest market news
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {NEWS.map((n) => (
                <li key={n.headline} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-foreground">
                    {n.headline}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.source} • {n.time}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
