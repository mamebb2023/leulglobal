import { fmtPrice, fmtUpdated, shortStatusLabel } from "@/lib/format";
import { CATEGORIES, type CategoryId } from "@/lib/registry";
import type { Quote } from "@/lib/types";
import { ChangeBadge } from "./ChangeBadge";
import { StatusBadge } from "./StatusBadge";

function SourceCell({ quote }: { quote: Quote }) {
  return (
    <span className="text-xs text-muted-foreground">
      {quote.source ?? "—"}
    </span>
  );
}

/** Mobile FX summary: buying, selling and the NBE weighted average. */
function FxQuoteSummary({ quote }: { quote: Quote }) {
  const cells = [
    { label: "Buying", value: quote.buy },
    { label: "Selling", value: quote.sell },
    { label: "Mid", value: quote.price },
  ];

  return (
    <dl className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-muted/40 px-2.5 py-2">
      {cells.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-0.5 text-sm font-bold tabular-nums text-primary">
            {fmtPrice(value, quote.decimals)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CategoryTable({
  category,
  quotes,
}: {
  category: CategoryId;
  quotes: Quote[];
}) {
  const { cadence } = CATEGORIES[category];
  const isFx = category === "fx";

  return (
    <>
      {/* Mobile: stacked rows instead of a wide table */}
      <ul className="divide-y rounded-xl bg-card px-4 ring-1 ring-foreground/10 sm:hidden">
        {quotes.map((q) => (
          <li key={q.instrumentId} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {q.label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {q.price == null ? "No data yet" : q.unit}
                </p>
              </div>
              {isFx ? (
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  <ChangeBadge value={q.changePct} />
                  <StatusBadge
                    status={q.status}
                    label={shortStatusLabel(q.status, cadence)}
                  />
                </div>
              ) : (
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-primary">
                    {fmtPrice(q.price, q.decimals)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-1.5">
                    <ChangeBadge value={q.changePct} />
                    <StatusBadge
                      status={q.status}
                      label={shortStatusLabel(q.status, cadence)}
                    />
                  </div>
                </div>
              )}
            </div>

            {isFx && <FxQuoteSummary quote={q} />}

            <div className="mt-2 flex items-start justify-between gap-3 text-[11px] text-muted-foreground">
              <SourceCell quote={q} />
              <span className="text-right">Updated {fmtUpdated(q.asOf)}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Instrument
              </th>
              {isFx && (
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Buying
                </th>
              )}
              {isFx && (
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Selling
                </th>
              )}
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                {isFx ? "Mid" : "Price"}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Change
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Source
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotes.map((q) => (
              <tr key={q.instrumentId}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{q.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {q.price == null ? "No data yet" : q.unit}
                  </p>
                </td>
                {isFx && (
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                    {fmtPrice(q.buy, q.decimals)}
                  </td>
                )}
                {isFx && (
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                    {fmtPrice(q.sell, q.decimals)}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-bold tabular-nums text-primary">
                  {fmtPrice(q.price, q.decimals)}
                </td>
                <td className="px-4 py-3">
                  <ChangeBadge value={q.changePct} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={q.status}
                    label={shortStatusLabel(q.status, cadence)}
                  />
                </td>
                <td className="px-4 py-3">
                  <SourceCell quote={q} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {fmtUpdated(q.asOf)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
