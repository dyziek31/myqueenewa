/** Parses "12,50" or "12.50" into a number; returns NaN when invalid. */
export function parseAmount(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}
