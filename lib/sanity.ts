import "server-only";
import type { NormalizedQuote } from "./types";

const DEFAULT_MAX_JUMP_PCT = 25;

/**
 * Returns a reason string if the quote must be rejected, else null.
 * `maxJumpPct` is per provider: an official FX rate can move further in a day
 * than a spot crypto pair moves in five minutes.
 */
export function sanityCheck(
  q: NormalizedQuote,
  previous?: number | null,
  maxJumpPct = DEFAULT_MAX_JUMP_PCT,
): string | null {
  if (!Number.isFinite(q.price) || q.price <= 0)
    return "non-positive or invalid price";
  if (previous && previous > 0) {
    const jump = (Math.abs(q.price - previous) / previous) * 100;
    if (jump > maxJumpPct)
      return `jump of ${jump.toFixed(1)}% vs previous value`;
  }
  return null;
}
