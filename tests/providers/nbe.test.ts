import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  SOURCE,
  addisDate,
  parseNbeRates,
} from "../../lib/providers/nbe";
import { byProvider } from "../../lib/registry";

const payload = JSON.parse(
  readFileSync(
    new URL("../fixtures/nbe-exchange-rates-2026-11-17.json", import.meta.url),
    "utf8",
  ),
) as { success: boolean; data: unknown[] };

const quotesById = () =>
  new Map(parseNbeRates(payload).map((q) => [q.instrumentId, q]));

describe("parseNbeRates", () => {
  it("returns buying, selling and mid for all seven currencies", () => {
    const quotes = parseNbeRates(payload);
    const mids = byProvider("nbe").filter((i) => i.fxPart === "mid");

    expect(quotes).toHaveLength(21);
    expect(mids).toHaveLength(7);
    expect(new Set(quotes.map((q) => q.instrumentId)).size).toBe(21);
  });

  it("reads the official buying, selling and weighted-average fields", () => {
    const quotes = quotesById();

    expect(quotes.get("USDETB")?.price).toBeCloseTo(161.1913, 4);
    expect(quotes.get("USDETB_BUY")?.price).toBeCloseTo(161.1913, 4);
    expect(quotes.get("USDETB_SELL")?.price).toBeCloseTo(162.8032, 4);
    expect(quotes.get("EURETB")?.price).toBeCloseTo(178.3752, 4);
    expect(quotes.get("EURETB_BUY")?.price).toBeCloseTo(177.4877, 4);
    expect(quotes.get("KWDETB_SELL")?.price).toBeCloseTo(527.1242, 4);
  });

  it("converts the API's string numbers", () => {
    const cny = parseNbeRates(payload).find((q) => q.instrumentId === "CNYETB");

    expect(typeof cny?.price).toBe("number");
    expect(cny?.price).toBeCloseTo(24.298, 4);
  });

  it("stamps every rate at midnight in Addis Ababa", () => {
    // 2026-11-17T00:00+03:00 === 2026-11-16T21:00Z
    for (const quote of parseNbeRates(payload)) {
      expect(quote.asOf.toISOString()).toBe("2026-11-16T21:00:00.000Z");
    }
  });

  it("leaves change to be computed from history", () => {
    const eur = quotesById().get("EURETB");

    expect(eur?.changeAbs).toBeNull();
    expect(eur?.changePct).toBeNull();
  });

  it("labels the official source", () => {
    const kwd = quotesById().get("KWDETB");

    expect(kwd?.source).toBe(SOURCE);
    expect(kwd?.source).toContain("official daily rate");
  });

  it("ignores currencies outside the registry", () => {
    const withJpy = structuredClone(payload) as {
      success: boolean;
      data: Record<string, unknown>[];
    };
    withJpy.data.push({
      ...withJpy.data[0],
      buying: "1.01",
      selling: "1.02",
      weighted_average: "1.015",
      currency: { code: "JPY" },
    });

    const quotes = parseNbeRates(withJpy);

    expect(quotes).toHaveLength(21);
    expect(quotes.some((q) => q.instrumentId.startsWith("JPY"))).toBe(false);
  });

  it("rejects an unsuccessful or malformed response", () => {
    expect(() => parseNbeRates({ success: false, data: [] })).toThrow(
      /unsuccessful/,
    );
    expect(() => parseNbeRates({ success: true })).toThrow();
  });

  it("rejects a zero or non-numeric rate", () => {
    const zero = structuredClone(payload) as {
      success: boolean;
      data: Record<string, unknown>[];
    };
    zero.data[0].buying = "0";
    expect(() => parseNbeRates(zero)).toThrow();

    const text = structuredClone(payload) as {
      success: boolean;
      data: Record<string, unknown>[];
    };
    text.data[0].selling = "not-a-rate";
    expect(() => parseNbeRates(text)).toThrow();
  });
});

describe("addisDate", () => {
  it("uses the Addis Ababa calendar day", () => {
    expect(addisDate(new Date("2026-11-16T21:30:00Z"))).toBe("2026-11-17");
    expect(addisDate(new Date("2026-11-16T20:30:00Z"))).toBe("2026-11-16");
  });

  it("walks back across a weekend", () => {
    const sunday = new Date("2026-11-15T09:00:00Z");

    expect(addisDate(sunday)).toBe("2026-11-15");
    expect(addisDate(sunday, -1)).toBe("2026-11-14");
    expect(addisDate(sunday, -2)).toBe("2026-11-13");
  });
});
