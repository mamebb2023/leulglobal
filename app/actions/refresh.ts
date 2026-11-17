"use server";

import { refreshAll } from "@/lib/refresh";
import type { RefreshResult } from "@/lib/types";

/**
 * Manual refresh from the dashboard. The per-provider cadence still applies,
 * so pressing this cannot bypass a provider's free-tier quota: providers that
 * are not due are skipped.
 */
export async function refreshNowAction(): Promise<RefreshResult> {
  try {
    const summary = await refreshAll();

    if (typeof summary.mode === "string") {
      return { ok: true, message: summary.mode };
    }

    const results = Object.values(summary);
    const updated = results.filter((value) => value.startsWith("ok")).length;
    const skipped = results.filter((value) =>
      value.startsWith("skipped"),
    ).length;
    const failed = results.filter((value) => value.startsWith("failed")).length;

    if (failed > 0) {
      return {
        ok: false,
        message: `${failed} provider${failed === 1 ? "" : "s"} failed${
          updated > 0 ? `, ${updated} updated` : ""
        }`,
      };
    }

    if (updated === 0) {
      return { ok: true, message: "Already up to date" };
    }

    return {
      ok: true,
      message: `${updated} updated${skipped > 0 ? `, ${skipped} not due` : ""}`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message.slice(0, 120) : "Refresh failed",
    };
  }
}
