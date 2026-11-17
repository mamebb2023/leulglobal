import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseOil } from "../../lib/providers/oil";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/oil.json", import.meta.url), "utf8"),
) as unknown;

describe("parseOil", () => {
  const quotes = parseOil(fixture);
  const byId = new Map(quotes.map((q) => [q.instrumentId, q]));

  it("maps the two crude benchmarks and four refined products", () => {
    expect([...byId.keys()].sort()).toEqual([
      "BRENT",
      "DIESEL",
      "GASOLINE",
      "JET",
      "LPG",
      "WTI",
    ]);
  });

  it("uses observed_at and the provider's 24h change for crude", () => {
    const wti = byId.get("WTI")!;
    const brent = byId.get("BRENT")!;

    expect(wti.price).toBe(86.04);
    expect(wti.changeAbs).toBe(-2.34);
    expect(wti.changePct).toBe(-2.65);
    expect(wti.asOf.toISOString()).toBe("2026-11-17T10:55:53.000Z");

    expect(brent.price).toBe(92.8);
    expect(brent.changePct).toBe(-2.72);
    expect(brent.asOf.toISOString()).toBe("2026-11-17T10:51:00.000Z");
  });

  it("parses the refined-product benchmarks", () => {
    expect(byId.get("DIESEL")?.price).toBe(4.08);
    expect(byId.get("GASOLINE")?.price).toBe(2.53);
    expect(byId.get("JET")?.price).toBe(4.04);
    expect(byId.get("LPG")?.price).toBe(1.06);
    expect(byId.get("DIESEL")?.asOf.toISOString()).toBe(
      "2026-11-17T00:08:44.000Z",
    );
  });

  it("labels futures and spot sources separately", () => {
    for (const id of ["WTI", "BRENT"]) {
      expect(byId.get(id)?.source).toBe(
        "OilPriceAPI (front-month futures)",
      );
    }
    for (const id of ["DIESEL", "GASOLINE", "JET", "LPG"]) {
      expect(byId.get(id)?.source).toBe("OilPriceAPI (spot)");
    }
  });

  it("ignores codes that are not in the registry", () => {
    const out = parseOil({
      status: "success",
      data: {
        prices: [
          { code: "NAT_GAS_USD", price: 3.1 },
          { code: "WTI_USD", price: 85.76 },
        ],
      },
    });

    expect(out).toHaveLength(1);
    expect(out[0].instrumentId).toBe("WTI");
  });

  it("rejects a failed status", () => {
    expect(() => parseOil({ status: "error", data: { prices: [] } })).toThrow();
  });
});
