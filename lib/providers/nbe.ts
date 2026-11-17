import "server-only";
import { z } from "zod";
import { fetchJson } from "../http";
import { byProvider } from "../registry";
import type { NormalizedQuote, Provider } from "../types";

// The table on nbe.gov.et/exchange/indicatives-rates/ is filled by this API.
// One dated request returns every currency, so all seven cost one call.
const BASE = "https://api.nbe.gov.et/api/filter-exchange-rates";
const TIME_ZONE = "Africa/Addis_Ababa";

// Weekends and public holidays have no publication. Looking back a few days
// keeps the last business day's official rate instead of an empty card.
const MAX_LOOKBACK_DAYS = 5;

export const SOURCE = "National Bank of Ethiopia (official daily rate)";

/** NBE sends every numeric field as a string. */
const PositiveRate = z
  .union([z.string(), z.number()])
  .transform(Number)
  .pipe(z.number().positive());

export const ExchangeRate = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  buying: PositiveRate,
  selling: PositiveRate,
  weighted_average: PositiveRate,
  currency: z.object({ code: z.string().min(2) }),
});

export const ExchangeRates = z.object({
  success: z.boolean(),
  data: z.array(ExchangeRate),
});

const FIELD = {
  mid: "weighted_average",
  buy: "buying",
  sell: "selling",
} as const;

/**
 * Turns one NBE response into a quote for every registered series. The mid
 * keeps the weighted average NBE publishes as its indicative rate; buying and
 * selling are the official sides of the daily quote.
 */
export function parseNbeRates(raw: unknown): NormalizedQuote[] {
  const parsed = ExchangeRates.parse(raw);

  if (!parsed.success) {
    throw new Error("NBE reported an unsuccessful response");
  }

  const instruments = byProvider("nbe");
  const quotes = new Map<string, NormalizedQuote>();

  for (const row of parsed.data) {
    const code = row.currency.code.toUpperCase();
    const matches = instruments.filter((i) => i.providerSymbol === code);
    if (matches.length === 0) continue;

    const asOf = new Date(`${row.date}T00:00:00+03:00`);
    if (Number.isNaN(asOf.getTime())) continue;

    for (const inst of matches) {
      if (!inst.fxPart) continue;
      quotes.set(inst.id, {
        instrumentId: inst.id,
        price: row[FIELD[inst.fxPart]],
        // The refresh job computes this from the previous history row.
        changeAbs: null,
        changePct: null,
        // NBE rates are dated, not timestamped: use midnight in Addis Ababa.
        asOf,
        source: SOURCE,
      });
    }
  }

  return [...quotes.values()];
}

/** Calendar day in Addis Ababa, e.g. "2026-11-17"; offset is in days. */
export function addisDate(now = new Date(), offsetDays = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now.getTime() + offsetDays * 86_400_000));

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export const nbe: Provider = {
  id: "nbe",
  async fetch(opts) {
    // Ask for today first; on a weekend or holiday walk back to the most
    // recent publication. A transport or quota error is not a date miss, so
    // it propagates instead of multiplying rate-limited requests.
    for (let offset = 0; offset <= MAX_LOOKBACK_DAYS; offset++) {
      const raw = await fetchJson(
        `${BASE}?date=${addisDate(new Date(), -offset)}`,
        {},
        { retries: opts?.retries ?? 2, timeoutMs: opts?.timeoutMs },
      );

      const quotes = parseNbeRates(raw);
      if (quotes.length > 0) return quotes;
    }

    throw new Error(
      `NBE published no rates in the last ${MAX_LOOKBACK_DAYS + 1} days`,
    );
  },
};
