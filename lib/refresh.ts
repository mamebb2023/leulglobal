import "server-only";
import { getDb, errorMessage } from "./db";
import { providers } from "./providers";
import { PROVIDERS, getInstrument, type ProviderId } from "./registry";
import { sanityCheck } from "./sanity";
import type { NormalizedQuote } from "./types";

const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

/**
 * Due means "the last attempt, successful or not, is older than the provider's
 * interval". Failed attempts are logged before they happen, so a provider that
 * keeps erroring cannot be retried every cron tick and burn its free tier.
 */
async function isDue(provider: ProviderId): Promise<boolean> {
  const interval = PROVIDERS[provider].refreshEveryMinutes;
  const { data, error } = await getDb()
    .from("refresh_log")
    .select("ran_at")
    .eq("provider", provider)
    .order("ran_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(`refresh_log read failed: ${error.message}`);
  if (!data?.length) return true;

  const age = Date.now() - new Date(data[0].ran_at).getTime();
  return age >= (interval - 1) * 60_000;
}

async function previousPrices(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await getDb()
    .from("quotes_latest")
    .select("instrument_id, price")
    .in("instrument_id", ids);

  if (error) throw new Error(`quotes_latest read failed: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.instrument_id, Number(r.price)]));
}

/**
 * Providers that do not supply a 24h change (FX) get one from the most
 * recent earlier history row. For a daily series that is the previous business
 * day, which is more robust than a fixed 24h window across weekends.
 */
async function fillChangeFromHistory(q: NormalizedQuote): Promise<void> {
  if (q.changePct != null) return;

  const { data, error } = await getDb()
    .from("quote_history")
    .select("price")
    .eq("instrument_id", q.instrumentId)
    .lt("as_of", q.asOf.toISOString())
    .order("as_of", { ascending: false })
    .limit(1);

  if (error) throw new Error(`quote_history read failed: ${error.message}`);
  if (!data?.length) return;

  const previous = Number(data[0].price);
  if (!Number.isFinite(previous) || previous <= 0) return;

  q.changeAbs = q.price - previous;
  q.changePct = ((q.price - previous) / previous) * 100;
}

async function refreshProvider(provider: ProviderId): Promise<string> {
  if (!(await isDue(provider))) return "skipped (not due)";

  const db = getDb();
  const started = Date.now();

  // Log the attempt up front. A crash or timeout still counts toward the
  // cadence instead of triggering an immediate retry.
  const { data: attempt, error: attemptError } = await db
    .from("refresh_log")
    .insert({ provider, ok: false, quotes: 0, error: "attempt started" })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    throw new Error(`refresh_log insert failed: ${attemptError?.message ?? "no row"}`);
  }

  const accepted: NormalizedQuote[] = [];
  const rejected: string[] = [];

  try {
    const quotes = await providers[provider].fetch({
      retries: PROVIDERS[provider].retries,
    });

    const previous = await previousPrices(
      quotes.map((q) => q.instrumentId),
    );

    for (const q of quotes) {
      const instrument = getInstrument(q.instrumentId);

      if (!instrument || instrument.provider !== provider) {
        rejected.push(`${q.instrumentId}: not a ${provider} instrument`);
        continue;
      }
      if (Number.isNaN(q.asOf.getTime())) {
        rejected.push(`${q.instrumentId}: invalid as_of`);
        continue;
      }

      const reason = sanityCheck(
        q,
        previous.get(q.instrumentId),
        PROVIDERS[provider].maxJumpPct,
      );
      if (reason) {
        rejected.push(`${q.instrumentId}: ${reason}`);
        continue;
      }

      accepted.push(q);
    }

    for (const q of accepted) {
      await fillChangeFromHistory(q);
    }

    if (accepted.length > 0) {
      const fetchedAt = new Date().toISOString();

      const { error: latestError } = await db.from("quotes_latest").upsert(
        accepted.map((q) => ({
          instrument_id: q.instrumentId,
          category: getInstrument(q.instrumentId)!.category,
          price: q.price,
          change_abs: q.changeAbs,
          change_pct: q.changePct,
          source: q.source,
          as_of: q.asOf.toISOString(),
          fetched_at: fetchedAt,
        })),
        { onConflict: "instrument_id" },
      );
      if (latestError) {
        throw new Error(`quotes_latest upsert failed: ${latestError.message}`);
      }

      const { error: historyError } = await db.from("quote_history").upsert(
        accepted.map((q) => ({
          instrument_id: q.instrumentId,
          price: q.price,
          as_of: q.asOf.toISOString(),
        })),
        { onConflict: "instrument_id,as_of", ignoreDuplicates: true },
      );
      if (historyError) {
        throw new Error(`quote_history upsert failed: ${historyError.message}`);
      }
    }

    await db
      .from("refresh_log")
      .update({
        ok: true,
        quotes: accepted.length,
        duration_ms: Date.now() - started,
        error: rejected.join("; ") || null,
      })
      .eq("id", attempt.id);

    return `ok: ${accepted.length} saved${
      rejected.length ? `, ${rejected.length} rejected` : ""
    }`;
  } catch (e) {
    const message = errorMessage(e);

    await db
      .from("refresh_log")
      .update({
        ok: false,
        quotes: accepted.length,
        duration_ms: Date.now() - started,
        error: message.slice(0, 500),
      })
      .eq("id", attempt.id);

    throw e;
  }
}

export async function refreshAll(): Promise<Record<string, string>> {
  if (process.env.DATA_MODE === "mock") {
    return { mode: "mock: nothing to refresh" };
  }

  const summary: Record<string, string> = {};

  await Promise.all(
    PROVIDER_IDS.map(async (provider) => {
      try {
        summary[provider] = await refreshProvider(provider);
      } catch (e) {
        const message = errorMessage(e);
        summary[provider] = `failed: ${message.slice(0, 200)}`;
      }
    }),
  );

  return summary;
}
