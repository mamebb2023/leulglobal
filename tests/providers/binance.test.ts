import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseBinance } from "../../lib/providers/binance";
import { byProvider } from "../../lib/registry";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/binance.json", import.meta.url), "utf8"),
) as unknown;

describe("parseBinance", () => {
  const quotes = parseBinance(fixture);

  it("returns every crypto instrument", () => {
    expect(quotes).toHaveLength(7);
    expect(quotes).toHaveLength(byProvider("binance").length);
  });

  it("labels the source as Binance spot", () => {
    for (const q of quotes) expect(q.source).toBe("Binance spot");
  });

  it("returns positive prices and finite changes", () => {
    for (const q of quotes) {
      expect(q.price).toBeGreaterThan(0);
      expect(Number.isFinite(q.changeAbs)).toBe(true);
      expect(Number.isFinite(q.changePct)).toBe(true);
    }
  });

  it("uses the provider closeTime as asOf", () => {
    const raw = fixture as { symbol: string; closeTime: number }[];
    const btc = quotes.find((q) => q.instrumentId === "BTCUSDT");

    expect(btc).toBeDefined();
    expect(btc!.asOf.getTime()).toBe(
      raw.find((r) => r.symbol === "BTCUSDT")!.closeTime,
    );
  });

  it("ignores symbols that are not in the registry", () => {
    const withExtra = [
      ...(fixture as unknown[]),
      {
        symbol: "FAKEUSDT",
        lastPrice: "1.0",
        priceChange: "0.0",
        priceChangePercent: "0.0",
        closeTime: 0,
      },
    ];

    expect(parseBinance(withExtra)).toHaveLength(7);
  });
});
