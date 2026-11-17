import "server-only";
import { z } from "zod";
import { fetchJson } from "../http";
import type { NormalizedQuote, Provider } from "../types";

// Free tier allows 50 requests/day, so every code goes in one call. The two
// crude futures and four refined-product benchmarks share that request.
const BASE =
  "https://api.oilpriceapi.com/v1/prices/latest?by_code=WTI_USD,BRENT_CRUDE_USD,DIESEL_USD,GASOLINE_USD,JET_FUEL_USD,PROPANE_MONT_BELVIEU_USD";

const Change = z.object({
  amount: z.number().nullable().optional(),
  percent: z.number().nullable().optional(),
});

export const OilPrice = z.object({
  code: z.string(),
  price: z.number().positive(),
  observed_at: z.string().optional(),
  as_of: z.string().optional(),
  changes: z.object({ "24h": Change.optional() }).optional(),
});

export const OilResponse = z.object({
  status: z.string(),
  data: z.object({ prices: z.array(OilPrice) }),
});

const CODE_MAP: Record<string, { instrumentId: string; source: string }> = {
  WTI_USD: {
    instrumentId: "WTI",
    source: "OilPriceAPI (front-month futures)",
  },
  BRENT_CRUDE_USD: {
    instrumentId: "BRENT",
    source: "OilPriceAPI (front-month futures)",
  },
  DIESEL_USD: { instrumentId: "DIESEL", source: "OilPriceAPI (spot)" },
  GASOLINE_USD: { instrumentId: "GASOLINE", source: "OilPriceAPI (spot)" },
  JET_FUEL_USD: { instrumentId: "JET", source: "OilPriceAPI (spot)" },
  PROPANE_MONT_BELVIEU_USD: {
    instrumentId: "LPG",
    source: "OilPriceAPI (spot)",
  },
};

/**
 * The payload labels both benchmarks `instrument_type: "front_month_futures"`
 * (WTI on NYMEX, Brent on ICE), even though the top-level `type` says
 * "spot_price" — that field describes the quote, not the underlying contract.
 */
export function parseOil(raw: unknown): NormalizedQuote[] {
  const { status, data } = OilResponse.parse(raw);

  if (status !== "success") {
    throw new Error(`OilPriceAPI returned status "${status}"`);
  }

  const out: NormalizedQuote[] = [];

  for (const p of data.prices) {
    const mapped = CODE_MAP[p.code];
    if (!mapped) continue;

    const stamp = p.observed_at ?? p.as_of;
    const asOf = stamp ? new Date(stamp) : new Date();
    if (Number.isNaN(asOf.getTime())) {
      throw new Error(`invalid OilPriceAPI timestamp for ${p.code}`);
    }

    const change = p.changes?.["24h"];

    out.push({
      instrumentId: mapped.instrumentId,
      price: p.price,
      changeAbs: change?.amount ?? null,
      changePct: change?.percent ?? null,
      asOf,
      source: mapped.source,
    });
  }

  return out;
}

export const oil: Provider = {
  id: "oil",
  async fetch(opts) {
    const key = process.env.OILPRICE_API_KEY;
    if (!key) throw new Error("OILPRICE_API_KEY is not set");

    const raw = await fetchJson(
      BASE,
      { headers: { Authorization: `Token ${key}` } },
      opts,
    );

    return parseOil(raw);
  },
};
