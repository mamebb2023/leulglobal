"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { thin } from "@/lib/chart";
import { fmtPrice, fmtTime } from "@/lib/format";

export interface PricePoint {
  t: string;
  price: number;
}

const HEIGHT = 180;
const PAD = { right: 12, top: 12, bottom: 22 };

export function PriceChart({
  label,
  points,
  unit,
  decimals,
}: {
  label: string;
  points: PricePoint[];
  unit: string;
  decimals: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const next = Math.floor(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => thin(points, 240), [points]);

  if (data.length < 2) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40">
        <p className="text-sm font-semibold text-foreground">Collecting data</p>
        <p className="px-6 text-center text-xs text-muted-foreground">
          A chart appears once two or more updates are stored.
        </p>
      </div>
    );
  }

  const prices = data.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = max - min || Math.max(max * 0.01, 0.01);
  const lo = min - spread * 0.08;
  const hi = max + spread * 0.08;

  const axis = [hi, (hi + lo) / 2, lo];
  const axisLabels = axis.map((value) => fmtPrice(value, decimals));

  // Reserve as much room as the widest axis label needs (~6px per character at
  // 10px), so a value like 64,698.73 is never clipped at the left edge.
  const left = Math.min(
    96,
    Math.max(
      34,
      Math.ceil(Math.max(...axisLabels.map((text) => text.length)) * 6) + 10,
    ),
  );

  const innerW = Math.max(10, width - left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const times = data.map((p) => new Date(p.t).getTime());
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const span = t1 - t0 || 1;

  const x = (i: number) => left + ((times[i] - t0) / span) * innerW;
  const y = (price: number) =>
    PAD.top + (1 - (price - lo) / (hi - lo)) * innerH;

  const line = data
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`,
    )
    .join(" ");

  const last = data[data.length - 1];
  const first = data[0];
  const rising = last.price >= first.price;
  const trendClass = rising ? "text-up" : "text-down";

  const hovered = hover == null ? null : data[hover];
  const hoverX = hover == null ? 0 : x(hover);
  const hoverY = hover == null ? 0 : y(data[hover].price);
  const tooltipLeft = Math.min(Math.max(hoverX, 70), Math.max(70, width - 70));

  return (
    <div ref={wrap} className="relative w-full">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`${label}, ${unit}, last 7 days. Lowest ${fmtPrice(
          min,
          decimals,
        )}, highest ${fmtPrice(max, decimals)}.`}
        className={`block ${trendClass}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const px = event.clientX - box.left;
          let nearest = 0;
          let best = Infinity;
          for (let i = 0; i < data.length; i++) {
            const d = Math.abs(x(i) - px);
            if (d < best) {
              best = d;
              nearest = i;
            }
          }
          setHover(nearest);
        }}
      >
        <defs>
          <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {axis.map((value, index) => (
          <g key={index}>
            <line
              x1={left}
              x2={width - PAD.right}
              y1={y(value)}
              y2={y(value)}
              className="stroke-foreground/10"
              strokeDasharray={index === 1 ? "3 4" : undefined}
            />
            <text
              x={left - 8}
              y={y(value) + 3.5}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] tabular-nums"
            >
              {axisLabels[index]}
            </text>
          </g>
        ))}

        <path
          d={`${line} L${x(data.length - 1).toFixed(1)},${(
            HEIGHT - PAD.bottom
          ).toFixed(1)} L${x(0).toFixed(1)},${(HEIGHT - PAD.bottom).toFixed(1)} Z`}
          fill="url(#price-fill)"
          stroke="none"
        />
        <path d={line} fill="none" stroke="currentColor" strokeWidth={2} />

        {hover != null && (
          <>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD.top}
              y2={HEIGHT - PAD.bottom}
              className="stroke-foreground/20"
              strokeDasharray="3 3"
            />
            <circle
              cx={hoverX}
              cy={hoverY}
              r={4}
              fill="currentColor"
              className="stroke-card"
              strokeWidth={2}
            />
          </>
        )}

        <text
          x={left}
          y={HEIGHT - 6}
          className="fill-muted-foreground text-[10px]"
        >
          {fmtTime(new Date(t0).toISOString()).split(",")[0]}
        </text>
        <text
          x={width - PAD.right}
          y={HEIGHT - 6}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {fmtTime(new Date(t1).toISOString()).split(",")[0]}
        </text>
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border bg-card px-2 py-1 text-center shadow-sm"
          style={{ left: tooltipLeft }}
        >
          <p className="text-xs font-bold tabular-nums text-foreground">
            {fmtPrice(hovered.price, decimals)}{" "}
            <span className="font-normal text-muted-foreground">{unit}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            {fmtTime(hovered.t)}
          </p>
        </div>
      )}
    </div>
  );
}
