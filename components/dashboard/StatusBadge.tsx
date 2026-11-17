import type { QuoteStatus } from "@/lib/types";

const STYLES: Record<QuoteStatus, string> = {
  fresh: "bg-up/10 text-up",
  delayed: "bg-amber-100 text-amber-700",
  stale: "bg-down/10 text-down",
  unavailable: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  label,
}: {
  status: QuoteStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}
