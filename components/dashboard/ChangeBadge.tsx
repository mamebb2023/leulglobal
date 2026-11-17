import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { fmtPct } from "@/lib/format";

export function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
        up ? "bg-up/10 text-up" : "bg-down/10 text-down"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
      )}
      {fmtPct(value)}
    </span>
  );
}
