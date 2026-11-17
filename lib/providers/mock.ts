import "server-only";
import { INSTRUMENTS } from "../registry";
import type { NormalizedQuote, Provider } from "../types";

/**
 * Deterministic stand-in used only when DATA_MODE=mock. Every quote is
 * labelled "MOCK DATA" and the dashboard shows a permanent banner.
 */
export const mock: Provider = {
  id: "mock",
  async fetch() {
    const now = Date.now();
    return INSTRUMENTS.map((i, n): NormalizedQuote => {
      const base = 100 + n * 37;
      const drift = Math.sin(now / 60_000 + n) * 2;
      return {
        instrumentId: i.id,
        price: base + drift,
        changeAbs: drift,
        changePct: (drift / base) * 100,
        asOf: new Date(now),
        source: "MOCK DATA",
      };
    });
  },
};
