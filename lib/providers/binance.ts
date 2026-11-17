import "server-only";
import { z } from "zod";
import { fetchJson } from "../http";
import { byProvider } from "../registry";
import type { NormalizedQuote, Provider } from "../types";

// Public market-data host. api.binance.com returns HTTP 451 from some regions.
const BASE = "https://data-api.binance.vision/api/v3";

export const Ticker = z.object({
  symbol: z.string(),
  lastPrice: z.string(),
  priceChange: z.string(),
  priceChangePercent: z.string(),
  closeTime: z.number(),
});

/**
 * Missing symbols are skipped rather than thrown: one delisted pair must not
 * take the whole crypto category down.
 */
export function parseBinance(raw: unknown): NormalizedQuote[] {
  const rows = z.array(Ticker).parse(raw);
  const out: NormalizedQuote[] = [];

  for (const inst of byProvider("binance")) {
    const t = rows.find((r) => r.symbol === inst.providerSymbol);
    if (!t) continue;

    out.push({
      instrumentId: inst.id,
      price: Number(t.lastPrice),
      changeAbs: Number(t.priceChange),
      changePct: Number(t.priceChangePercent),
      // closeTime is epoch milliseconds, i.e. the end of the 24h window.
      asOf: new Date(t.closeTime),
      source: "Binance spot",
    });
  }

  return out;
}

export const binance: Provider = {
  id: "binance",
  async fetch(opts) {
    const symbols = JSON.stringify(
      byProvider("binance").map((i) => i.providerSymbol),
    );

    return parseBinance(
      await fetchJson(
        `${BASE}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
        {},
        { retries: opts?.retries ?? 2, timeoutMs: opts?.timeoutMs },
      ),
    );
  },
};
