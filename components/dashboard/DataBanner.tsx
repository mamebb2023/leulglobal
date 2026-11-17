import { TriangleAlert } from "lucide-react";
import type { Quote } from "@/lib/types";

export function MockBanner() {
  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800"
    >
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
      MOCK DATA, not real prices
    </div>
  );
}

export function OutOfDateBanner({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return null;

  const allBad = quotes.every(
    (q) => q.status === "stale" || q.status === "unavailable",
  );
  if (!allBad) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
    >
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
      Prices may be out of date
    </div>
  );
}
