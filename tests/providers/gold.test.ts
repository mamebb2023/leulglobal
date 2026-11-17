import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseGold } from "../../lib/providers/gold";
import { byProvider, getInstrument } from "../../lib/registry";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/gold.json", import.meta.url), "utf8"),
) as unknown;

const rawData = (fixture as { data: Record<string, unknown> }).data;

describe("parseGold", () => {
  const quotes = parseGold(fixture);

  it("returns all eight registered metals in table order", () => {
    expect(quotes.map((q) => q.instrumentId)).toEqual([
      "XAU",
      "XAG",
      "XPT",
      "XPD",
      "HG",
      "ALI",
      "NI",
      "ZN",
    ]);
    expect(quotes).toHaveLength(byProvider("gold").length);
  });

  it("uses each metal's own price, 24h change and timestamp", () => {
    const xau = quotes.find((q) => q.instrumentId === "XAU")!;
    const copper = quotes.find((q) => q.instrumentId === "HG")!;
    const zinc = quotes.find((q) => q.instrumentId === "ZN")!;

    expect(xau.price).toBeCloseTo(3861.00386, 5);
    expect(xau.changeAbs).toBeCloseTo(-3.24304, 5);
    expect(xau.changePct).toBeCloseTo(-0.0839, 4);
    expect(xau.asOf.toISOString()).toBe("2026-11-17T09:25:50.105Z");

    expect(copper.price).toBeCloseTo(5.96141, 5);
    expect(copper.changePct).toBeCloseTo(-0.5253, 4);
    expect(copper.asOf.toISOString()).toBe("2026-11-17T09:25:02.794Z");

    expect(zinc.price).toBeCloseTo(3677.9, 5);
    expect(zinc.changePct).toBeCloseTo(-0.3711, 4);
    expect(zinc.asOf.toISOString()).toBe("2026-11-17T09:15:08.392Z");
  });

  it("labels spot and exchange-futures sources honestly", () => {
    expect(quotes.find((q) => q.instrumentId === "XAU")!.source).toBe(
      "MetalCharts spot",
    );
    expect(quotes.find((q) => q.instrumentId === "XAG")!.source).toBe(
      "MetalCharts spot",
    );
    expect(quotes.find((q) => q.instrumentId === "HG")!.source).toBe(
      "MetalCharts (COMEX futures)",
    );
    expect(quotes.find((q) => q.instrumentId === "ALI")!.source).toBe(
      "MetalCharts (LME futures)",
    );
    expect(quotes.find((q) => q.instrumentId === "ZN")!.source).toBe(
      "MetalCharts spot",
    );
  });

  it("keeps registry units and instrument types aligned with the payload", () => {
    expect(getInstrument("XAU")?.unit).toBe("USD per troy oz");
    expect(getInstrument("HG")?.unit).toBe("USD per lb");
    expect(getInstrument("ALI")?.unit).toBe("USD per metric ton");
    expect(getInstrument("ZN")?.unit).toBe("USD per metric ton");

    expect(getInstrument("XAU")?.instrumentType).toBe("spot");
    expect(getInstrument("HG")?.instrumentType).toBe("futures");
    expect(getInstrument("ALI")?.instrumentType).toBe("futures");
    expect(getInstrument("NI")?.instrumentType).toBe("futures");
    expect(getInstrument("ZN")?.instrumentType).toBe("spot");
  });

  it("ignores metals that are not registered", () => {
    const ids = new Set(quotes.map((q) => q.instrumentId));
    for (const symbol of ["PB", "JBP", "CO", "LC", "UXA"]) {
      expect(ids.has(symbol)).toBe(false);
    }
  });

  it("skips a missing metal instead of failing the whole fetch", () => {
    const data = { ...rawData };
    delete data.XAU;

    const out = parseGold({ success: true, data });

    expect(out).toHaveLength(7);
    expect(out.find((q) => q.instrumentId === "XAU")).toBeUndefined();
  });

  it("throws when no registered metal is present", () => {
    expect(() =>
      parseGold({
        success: true,
        data: { PB: { price: 1, timestamp: "2026-11-17T09:15:08.392Z" } },
      }),
    ).toThrow("none of the registered metals");
  });

  it("rejects an invalid provider timestamp", () => {
    expect(() =>
      parseGold({ data: { XAU: { price: 3861, timestamp: "not-a-date" } } }),
    ).toThrow("invalid MetalCharts timestamp");
  });
});
