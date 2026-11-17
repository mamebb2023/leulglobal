import type { Cadence } from "./registry";
import type { QuoteStatus } from "./types";

const TIME_ZONE = "Africa/Addis_Ababa";

export const fmtPrice = (n: number | null, decimals: number) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

export const fmtPct = (n: number | null) =>
  n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeZone: TIME_ZONE,
      }).format(new Date(iso))
    : "—";

/** 12-hour clock, e.g. "1:11 PM". */
export const fmtClock = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: TIME_ZONE,
      }).format(new Date(iso))
    : "—";

/** Date and 12-hour time, e.g. "17 Nov 2026, 1:11 PM". */
export const fmtTime = (iso: string | null) =>
  iso ? `${fmtDate(iso)}, ${fmtClock(iso)}` : "—";

/** Coarse age of an observation, e.g. "just now", "9 min ago", "2 days ago". */
export function fmtAgo(iso: string | null, now = Date.now()): string {
  if (!iso) return "—";
  const observed = new Date(iso).getTime();
  if (!Number.isFinite(observed)) return "—";

  const minutes = Math.floor(Math.max(0, now - observed) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Observation time plus its age, e.g. "17 Nov 2026, 1:11 PM · 9 min ago". */
export const fmtUpdated = (iso: string | null) =>
  iso ? `${fmtTime(iso)} · ${fmtAgo(iso)}` : "—";

/** True when an ISO timestamp falls on today's date in the display timezone. */
function isToday(iso: string): boolean {
  const day = new Intl.DateTimeFormat("en-CA", {
    dateStyle: "short",
    timeZone: TIME_ZONE,
  });
  const date = new Date(iso);
  return (
    !Number.isNaN(date.getTime()) && day.format(date) === day.format(new Date())
  );
}

/** Human label for a status badge, following the category's cadence. */
export function statusLabel(
  status: QuoteStatus,
  cadence: Cadence,
  asOf: string | null,
): string {
  if (status === "fresh") {
    if (cadence === "live") return "Live";
    if (cadence === "daily") {
      return `Daily rate, ${fmtDate(asOf)}${asOf ? ` · ${fmtAgo(asOf)}` : ""}`;
    }
    // Non-live series can be current while the observation is hours old, so
    // always show the clock and how long ago it was observed.
    if (!asOf) return "Updated —";
    return isToday(asOf)
      ? `Updated ${fmtClock(asOf)} · ${fmtAgo(asOf)}`
      : `Updated ${fmtTime(asOf)} · ${fmtAgo(asOf)}`;
  }
  if (status === "delayed") return "Delayed";
  if (status === "stale") return "Stale";
  return "Unavailable";
}

/**
 * Compact label for a single row. The long cadence wording ("Daily rate, 16
 * Nov 2026") belongs once in the page header, not on every price.
 */
export function shortStatusLabel(
  status: QuoteStatus,
  cadence: Cadence,
): string {
  if (status === "fresh") return cadence === "live" ? "Live" : "Current";
  if (status === "delayed") return "Delayed";
  if (status === "stale") return "Stale";
  return "Unavailable";
}

const SEVERITY: Record<QuoteStatus, number> = {
  fresh: 0,
  delayed: 1,
  stale: 2,
  unavailable: 3,
};

/** The worst status in a set, so one stale row cannot hide behind fresh ones. */
export function worstStatus(statuses: QuoteStatus[]): QuoteStatus {
  return statuses.reduce<QuoteStatus>(
    (worst, status) => (SEVERITY[status] > SEVERITY[worst] ? status : worst),
    "fresh",
  );
}
