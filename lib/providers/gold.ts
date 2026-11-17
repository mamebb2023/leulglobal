import "server-only";
import { z } from "zod";
import { fetchJson } from "../http";
import { byProvider, type InstrumentType } from "../registry";
import type { NormalizedQuote, Provider } from "../types";

// MetalCharts free tier: 200 requests/month. A single response contains every
// metal, so all eight registered instruments ride on the same 6h call.
const BASE = "https://api.metalcharts.org/v1/prices";

export const Metal = z.object({
  price: z.number().positive(),
  timestamp: z.string().min(1),
  exchange: z.string().optional(),
  change24h: z.number().nullable().optional(),
  changePercent24h: z.number().nullable().optional(),
});

/**
 * `data` also carries metals we do not track (PB, JBP, CO, LC, UXA). Keep the
 * record loose and validate each registered symbol individually, so one new
 * provider entry cannot break the whole fetch.
 */
export const GoldResponse = z.object({
  success: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()),
});

/**
 * Spot metals are quoted by MetalCharts directly. Copper, aluminum and nickel
 * arrive as exchange futures, so name the venue instead of calling them spot.
 */
export function sourceLabel(
  instrumentType: InstrumentType,
  exchange: string | undefined,
): string {
  if (instrumentType !== "futures") return "MetalCharts spot";
  return exchange && exchange !== "SPOT"
    ? `MetalCharts (${exchange} futures)`
    : "MetalCharts futures";
}

export function parseGold(raw: unknown): NormalizedQuote[] {
  const { data } = GoldResponse.parse(raw);
  const out: NormalizedQuote[] = [];

  for (const inst of byProvider("gold")) {
    const parsed = Metal.safeParse(data[inst.providerSymbol]);
    if (!parsed.success) continue;

    const metal = parsed.data;
    const asOf = new Date(metal.timestamp);
    if (Number.isNaN(asOf.getTime())) {
      throw new Error(
        `invalid MetalCharts timestamp for ${inst.providerSymbol}: ${metal.timestamp}`,
      );
    }

    out.push({
      instrumentId: inst.id,
      price: metal.price,
      changeAbs: metal.change24h ?? null,
      changePct: metal.changePercent24h ?? null,
      asOf,
      source: sourceLabel(inst.instrumentType, metal.exchange),
    });
  }

  if (out.length === 0) {
    throw new Error("MetalCharts returned none of the registered metals");
  }

  return out;
}

export const gold: Provider = {
  id: "gold",
  async fetch(opts) {
    const key = process.env.METALS_API_KEY;
    if (!key) throw new Error("METALS_API_KEY is not set");

    const raw = await fetchJson(
      BASE,
      { headers: { Authorization: `Bearer ${key}` } },
      opts,
    );

    return parseGold(raw);
  },
};
