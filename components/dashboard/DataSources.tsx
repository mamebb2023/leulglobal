/**
 * Provider credits. MetalCharts requires a visible link wherever its prices
 * are shown publicly, so this footer lives on every dashboard page.
 */
export function DataSources() {
  return (
    <footer className="mx-auto mt-10 max-w-6xl border-t pt-4 text-[11px] leading-relaxed text-muted-foreground">
      Sources: Binance spot · National Bank of Ethiopia · OilPriceAPI ·{" "}
      <a
        href="https://metalcharts.org"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Metal prices by MetalCharts
      </a>
      . Every price carries the time it was observed.
    </footer>
  );
}
