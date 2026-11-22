import "server-only";
import { cache } from "react";
import { getDb, isDbConfigured, errorMessage } from "./db";
import {
  CATEGORIES,
  allByCategory,
  byCategory,
  fxId,
  type CategoryId,
} from "./registry";
import { providers } from "./providers";
import type { Quote, QuoteStatus } from "./types";

interface StoredRow {
  price: number;
  change_pct: number | null;
  source: string;
  as_of: string;
  fetched_at: string;
}

export function statusFor(
  cat: CategoryId,
  asOf: string | null,
  now?: number,
  override?: { freshWithinMinutes?: number; staleAfterMinutes?: number },
): QuoteStatus {
  // Resolve `now` inside the function body so it is never evaluated at import
  // time, which would trigger the "unstable value Date.now()" prerender error.
  const timestamp = now ?? Date.now();
  if (!asOf) return "unavailable";
  const ageMin = (timestamp - new Date(asOf).getTime()) / 60_000;
  if (!Number.isFinite(ageMin)) return "unavailable";
  const c = CATEGORIES[cat];
  const fresh = override?.freshWithinMinutes ?? c.freshWithinMinutes;
  const stale = override?.staleAfterMinutes ?? c.staleAfterMinutes;
  if (ageMin <= fresh) return "fresh";
  if (ageMin <= stale) return "delayed";
  return "stale";
}

async function loadQuotes(category: CategoryId): Promise<Quote[]> {
  const insts = byCategory(category);
  // FX mids are stored with their buying and selling series, which are loaded
  // here but never listed as separate instruments.
  const stored = allByCategory(category);
  const rows = new Map<string, StoredRow>();

  if (process.env.DATA_MODE === "mock") {
    // The mock provider returns every instrument, so one call fills any category.
    const all = await providers.binance.fetch();
    for (const q of all) {
      rows.set(q.instrumentId, {
        price: q.price,
        change_pct: q.changePct,
        source: q.source,
        as_of: q.asOf.toISOString(),
        fetched_at: q.asOf.toISOString(),
      });
    }
  } else if (isDbConfigured()) {
    try {
      const { data, error } = await getDb()
        .from("quotes_latest")
        .select("instrument_id, price, change_pct, source, as_of, fetched_at")
        .in(
          "instrument_id",
          stored.map((i) => i.id),
        );

      if (error) throw error;

      for (const r of data ?? []) {
        rows.set(r.instrument_id, {
          price: Number(r.price),
          change_pct: r.change_pct == null ? null : Number(r.change_pct),
          source: r.source,
          as_of: r.as_of,
          fetched_at: r.fetched_at,
        });
      }
    } catch (e) {
      // A database outage must not take the dashboard down: every instrument
      // falls through to "Unavailable" instead of rendering a number.
      console.error(
        "getQuotes: database read failed:",
        errorMessage(e),
      );
    }
  }
  // Without mock mode or a configured database, no rows exist and every quote
  // is returned as "Unavailable".

  return insts.map((i): Quote => {
    const r = rows.get(i.id);
    const fxMid = i.category === "fx" && (i.fxPart ?? "mid") === "mid";

    // Only pair a side with the mid from the same observation, so a partially
    // failed refresh can never show yesterday's buy rate beside today's mid.
    const side = (part: "buy" | "sell") => {
      if (!fxMid || !r) return null;
      const row = rows.get(fxId(i.providerSymbol, part));
      return row?.as_of === r.as_of ? row.price : null;
    };

    return {
      instrumentId: i.id,
      label: i.label,
      category,
      instrumentType: i.instrumentType,
      price: r?.price ?? null,
      buy: side("buy"),
      sell: side("sell"),
      unit: i.unit,
      currency: i.currency,
      decimals: i.decimals,
      changePct: r?.change_pct ?? null,
      source: r?.source ?? null,
      asOf: r?.as_of ?? null,
      fetchedAt: r?.fetched_at ?? null,
      status: statusFor(category, r?.as_of ?? null, Date.now(), i),
    };
  });
}

/**
 * Deduped per request, so the page header and the table share one query
 * instead of hitting Postgres twice for the same category.
 */
export const getQuotes = cache(loadQuotes);

export async function getHistory(
  instrumentId: string,
  days = 7,
): Promise<{ t: string; price: number }[]> {
  if (!isDbConfigured()) return [];

  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  try {
    const { data, error } = await getDb()
      .from("quote_history")
      .select("as_of, price")
      .eq("instrument_id", instrumentId)
      .gte("as_of", since)
      .order("as_of", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((r) => ({
      t: r.as_of as string,
      price: Number(r.price),
    }));
  } catch (e) {
    console.error(
      "getHistory: database read failed:",
      errorMessage(e),
    );
    return [];
  }
}
