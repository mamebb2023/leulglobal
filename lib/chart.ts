/**
 * Keeps the first and last points and samples the rest evenly, so a week of
 * 5-minute crypto data does not ship thousands of coordinates to the browser.
 */
export function thin<T>(items: T[], max: number): T[] {
  if (max < 2 || items.length <= max) return items;

  const step = (items.length - 1) / (max - 1);
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(items[Math.round(i * step)]);
  return out;
}
