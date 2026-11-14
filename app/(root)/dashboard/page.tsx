type Card = { title: string; primary: string; note: string };

// Placeholders only. No live feeds are connected, so no values are shown.
const CARDS: Card[] = [
  {
    title: "Gold",
    primary: "Latest price / unit",
    note: "Source • Updated time",
  },
  { title: "Bitcoin", primary: "Latest price", note: "24h movement" },
  {
    title: "USD / ETB",
    primary: "Exchange rate",
    note: "Source • Updated time",
  },
  {
    title: "Oil & Commodities",
    primary: "Brent • WTI • Copper",
    note: "Unit • Source",
  },
];

const NEWS = [1, 2, 3];

function MarketCard({ title, primary, note }: Card) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#14243A]">
        {title}
      </h2>
      <p className="mt-3 text-2xl font-bold text-slate-300">—</p>
      <p className="mt-1 text-sm text-slate-600">{primary}</p>
      <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        {note}
      </p>
    </article>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting + data status */}
      <section>
        <h1 className="text-2xl font-bold text-[#14243A] sm:text-3xl">
          Good day
        </h1>
        <p className="mt-1 text-sm text-slate-600">Your market overview</p>
        <p className="mt-3 inline-block rounded-md bg-[#14243A] px-3 py-1.5 text-xs font-medium text-white">
          Data status:{" "}
          <span className="text-[#C8A34D]">no live feed connected</span>
        </p>
      </section>

      {/* Key price cards */}
      <section
        aria-label="Key markets"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {CARDS.map((c) => (
          <MarketCard key={c.title} {...c} />
        ))}
      </section>

      {/* Chart + news */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#14243A]">Market watch</h2>
          <div className="mt-3 flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 sm:h-72">
            Price history chart / selected watchlist
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[#14243A]">
            Latest market news
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {NEWS.map((n) => (
              <li key={n} className="py-3 text-sm">
                <p className="font-medium text-slate-700">[ Headline ]</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  [ Source ] • [ Time ]
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
