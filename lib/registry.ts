export type CategoryId = "gold" | "crypto" | "fx" | "commodities";
export type ProviderId = "binance" | "nbe" | "gold" | "oil";
export type InstrumentType = "spot" | "futures" | "official_rate";
export type Cadence = "live" | "delayed" | "daily";

/**
 * NBE publishes three values per currency: the official buying and selling
 * rates plus their weighted average. Each is stored as its own series, but only
 * the mid is listed, charted and counted as an instrument.
 */
export type FxRatePart = "mid" | "buy" | "sell";

export const fxId = (ccy: string, part: FxRatePart = "mid") =>
  part === "mid" ? `${ccy}ETB` : `${ccy}ETB_${part.toUpperCase()}`;

export interface Instrument {
  /** Stable id and DB key, e.g. "BTCUSDT". */
  id: string;
  /** UI label, e.g. "BTC / USDT". */
  label: string;
  category: CategoryId;
  provider: ProviderId;
  /** What the provider calls it. */
  providerSymbol: string;
  unit: string;
  currency: string;
  decimals: number;
  instrumentType: InstrumentType;
  /** Which NBE value this series carries. Absent for non-FX instruments. */
  fxPart?: FxRatePart;
  /**
   * Optional per-instrument status window, in minutes. Overrides the category
   * thresholds for a series whose publishing lag differs from its neighbours.
   */
  freshWithinMinutes?: number;
  staleAfterMinutes?: number;
}

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  href: string;
  overviewIds: string[];
  /** Age at or below this is "fresh". */
  freshWithinMinutes: number;
  /** Age above this is "stale"; in between is "delayed". */
  staleAfterMinutes: number;
  cadence: Cadence;
}

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  /** The refresh job calls this provider at most this often. */
  refreshEveryMinutes: number;
  /** Retries per run. Quota-limited providers stay at 0. */
  retries: number;
  /** Reject a quote that moves more than this against the stored value. */
  maxJumpPct: number;
}

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  gold: {
    id: "gold",
    label: "Gold",
    href: "/dashboard/gold",
    overviewIds: ["XAU", "XAG", "HG"],
    // 6h refresh, with room for one missed run before it reads as stale.
    freshWithinMinutes: 480,
    staleAfterMinutes: 1440,
    cadence: "delayed",
  },
  crypto: {
    id: "crypto",
    label: "Crypto",
    href: "/dashboard/crypto",
    overviewIds: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
    freshWithinMinutes: 10,
    staleAfterMinutes: 60,
    cadence: "live",
  },
  fx: {
    id: "fx",
    label: "FX Rates",
    href: "/dashboard/fx",
    overviewIds: ["USDETB", "EURETB", "GBPETB"],
    // NBE publishes once per business day; weekends must not read as stale.
    freshWithinMinutes: 2880,
    staleAfterMinutes: 5760,
    cadence: "daily",
  },
  commodities: {
    id: "commodities",
    label: "Commodities",
    href: "/dashboard/commodities",
    overviewIds: ["BRENT", "DIESEL", "GASOLINE"],
    // Oil futures refresh hourly; refined products publish daily or weekly
    // and carry their own per-instrument windows below.
    freshWithinMinutes: 90,
    staleAfterMinutes: 720,
    cadence: "delayed",
  },
};

/**
 * Refresh cadence is per provider, not per category: one MetalCharts call
 * returns all eight metals, and oil has its own quota.
 */
export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  binance: { id: "binance", label: "Binance spot", refreshEveryMinutes: 5, retries: 2, maxJumpPct: 25 },
  nbe: { id: "nbe", label: "National Bank of Ethiopia", refreshEveryMinutes: 360, retries: 2, maxJumpPct: 50 },
  // MetalCharts free tier: 200 requests/month. One 6h call covers every metal
  // (~120 calls/month), so adding metals costs no extra quota.
  gold: { id: "gold", label: "MetalCharts", refreshEveryMinutes: 360, retries: 0, maxJumpPct: 25 },
  // OilPriceAPI free tier: 50 requests/day.
  oil: { id: "oil", label: "OilPriceAPI", refreshEveryMinutes: 60, retries: 0, maxJumpPct: 35 },
};

const crypto = (sym: string, decimals: number): Instrument => ({
  id: `${sym}USDT`,
  label: `${sym} / USDT`,
  category: "crypto",
  provider: "binance",
  providerSymbol: `${sym}USDT`,
  unit: "USDT",
  currency: "USDT",
  decimals,
  instrumentType: "spot",
});

const fx = (ccy: string): Instrument[] =>
  (["mid", "buy", "sell"] as const).map((part) => ({
    id: fxId(ccy, part),
    label:
      part === "mid"
        ? `${ccy} / ETB`
        : `${ccy} / ETB ${part === "buy" ? "buying" : "selling"}`,
    category: "fx",
    provider: "nbe",
    providerSymbol: ccy,
    unit: `ETB per 1 ${ccy}`,
    currency: "ETB",
    decimals: 2,
    instrumentType: "official_rate",
    fxPart: part,
  }));

const metal = (
  symbol: string,
  label: string,
  unit: string,
  instrumentType: InstrumentType,
): Instrument => ({
  id: symbol,
  label,
  category: "gold",
  provider: "gold",
  providerSymbol: symbol,
  unit,
  currency: "USD",
  decimals: 2,
  instrumentType,
});

export const INSTRUMENTS: Instrument[] = [
  // One MetalCharts response carries every metal, so all eight share the same
  // 6h fetch. Order matches the provider's public table.
  metal("XAU", "Gold", "USD per troy oz", "spot"),
  metal("XAG", "Silver", "USD per troy oz", "spot"),
  metal("XPT", "Platinum", "USD per troy oz", "spot"),
  metal("XPD", "Palladium", "USD per troy oz", "spot"),
  metal("HG", "Copper", "USD per lb", "futures"),
  metal("ALI", "Aluminum", "USD per metric ton", "futures"),
  metal("NI", "Nickel", "USD per metric ton", "futures"),
  metal("ZN", "Zinc", "USD per metric ton", "spot"),
  crypto("BTC", 2),
  crypto("ETH", 2),
  crypto("BNB", 2),
  crypto("XRP", 4),
  crypto("SOL", 2),
  crypto("TRX", 4),
  crypto("DOGE", 5),
  ...["USD", "GBP", "EUR", "CHF", "KWD", "CNY", "AED"].flatMap(fx),
  {
    id: "BRENT",
    label: "Brent crude",
    category: "commodities",
    provider: "oil",
    providerSymbol: "BRENT_CRUDE_USD",
    unit: "USD per barrel",
    currency: "USD",
    decimals: 2,
    // OilPriceAPI's benchmark is the NYMEX front-month contract even though
    // its top-level quote type reads "spot_price".
    instrumentType: "futures",
  },
  {
    id: "WTI",
    label: "WTI crude",
    category: "commodities",
    provider: "oil",
    providerSymbol: "WTI_USD",
    unit: "USD per barrel",
    currency: "USD",
    decimals: 2,
    instrumentType: "futures",
  },
  // Refined-product benchmarks, not Ethiopian pump prices. OilPriceAPI
  // returns all six codes in the same request, so these cost no extra quota.
  {
    id: "DIESEL",
    label: "Diesel (ULSD)",
    category: "commodities",
    provider: "oil",
    providerSymbol: "DIESEL_USD",
    unit: "USD per gallon",
    currency: "USD",
    decimals: 2,
    instrumentType: "spot",
    // Daily source; the hourly futures window would mark it stale overnight.
    freshWithinMinutes: 2880,
    staleAfterMinutes: 10080,
  },
  {
    id: "GASOLINE",
    label: "Gasoline (RBOB)",
    category: "commodities",
    provider: "oil",
    providerSymbol: "GASOLINE_USD",
    unit: "USD per gallon",
    currency: "USD",
    decimals: 2,
    instrumentType: "spot",
    freshWithinMinutes: 2880,
    staleAfterMinutes: 10080,
  },
  {
    id: "JET",
    label: "Jet fuel / kerosene",
    category: "commodities",
    provider: "oil",
    providerSymbol: "JET_FUEL_USD",
    unit: "USD per gallon",
    currency: "USD",
    decimals: 2,
    instrumentType: "spot",
    // This source publishes weekly, so a six-day-old quote is still current.
    freshWithinMinutes: 14400,
    staleAfterMinutes: 43200,
  },
  {
    id: "LPG",
    label: "LPG (propane)",
    category: "commodities",
    provider: "oil",
    providerSymbol: "PROPANE_MONT_BELVIEU_USD",
    unit: "USD per gallon",
    currency: "USD",
    decimals: 2,
    instrumentType: "spot",
    freshWithinMinutes: 14400,
    staleAfterMinutes: 43200,
  },
];

export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

/** Only series shown on a category page or chart. */
export const isListed = (i: Instrument) =>
  i.fxPart == null || i.fxPart === "mid";

export const byCategory = (c: CategoryId) =>
  INSTRUMENTS.filter((i) => i.category === c && isListed(i));

/**
 * Every stored series in a category, including FX buy/sell components that
 * travel with a listed mid rate.
 */
export const allByCategory = (c: CategoryId) =>
  INSTRUMENTS.filter((i) => i.category === c);

export const byProvider = (p: ProviderId) =>
  INSTRUMENTS.filter((i) => i.provider === p);

export const getInstrument = (id: string) =>
  INSTRUMENTS.find((i) => i.id === id);
