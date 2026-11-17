"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { refreshNowAction } from "@/app/actions/refresh";
import { Button } from "@/components/ui/button";
import type { RefreshResult } from "@/lib/types";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RefreshResult | null>(null);

  const refresh = () => {
    startTransition(async () => {
      const next = await refreshNowAction();
      setResult(next);
      // Re-render the server components so the new prices appear.
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={refresh}
        disabled={pending}
        className="min-h-11 gap-2 px-3 text-xs font-semibold"
      >
        <RefreshCw
          className={pending ? "animate-spin" : undefined}
          aria-hidden
        />
        {pending ? "Refreshing…" : "Refresh prices"}
      </Button>

      {result && !pending && (
        <p
          role="status"
          className={`text-[11px] ${
            result.ok ? "text-muted-foreground" : "text-down"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
