import { fmtPrice } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { ChangeBadge } from "./ChangeBadge";

/**
 * A compact row for the overview cards. Status lives once in the card header,
 * because repeating "Daily rate, ..." on all three FX rows crowds the names.
 */
export function PriceRow({ quote }: { quote: Quote }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {quote.label}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {quote.price == null ? "No data yet" : quote.unit}
        </p>
        {(quote.buy != null || quote.sell != null) && (
          <p className="mt-0.5 truncate text-[10px] font-medium tabular-nums text-muted-foreground">
            Buy {fmtPrice(quote.buy, quote.decimals)} · Sell{" "}
            {fmtPrice(quote.sell, quote.decimals)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-bold tabular-nums text-primary">
          {fmtPrice(quote.price, quote.decimals)}
        </p>
        <ChangeBadge value={quote.changePct} />
      </div>
    </li>
  );
}
