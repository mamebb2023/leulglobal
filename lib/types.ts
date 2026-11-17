import type { CategoryId, InstrumentType } from "./registry";

export type QuoteStatus = "fresh" | "delayed" | "stale" | "unavailable";

/** Returned by providers. */
export interface NormalizedQuote {
  instrumentId: string;
  price: number;
  changeAbs: number | null;
  changePct: number | null;
  /** Provider timestamp if available, otherwise fetch time. */
  asOf: Date;
  /** e.g. "Binance spot". */
  source: string;
}

/** Returned to the UI. */
export interface Quote {
  instrumentId: string;
  label: string;
  category: CategoryId;
  instrumentType: InstrumentType;
  price: number | null;
  /** Official FX buy/sell sides; null for every other instrument. */
  buy: number | null;
  sell: number | null;
  unit: string;
  currency: string;
  decimals: number;
  changePct: number | null;
  source: string | null;
  /** ISO */
  asOf: string | null;
  /** ISO */
  fetchedAt: string | null;
  status: QuoteStatus;
}

export interface ProviderFetchOptions {
  retries?: number;
  timeoutMs?: number;
}

export interface Provider {
  id: string;
  fetch(opts?: ProviderFetchOptions): Promise<NormalizedQuote[]>;
}

/** Result of a manual refresh triggered from the dashboard. */
export interface RefreshResult {
  ok: boolean;
  message: string;
}
