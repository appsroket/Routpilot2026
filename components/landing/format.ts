// Shared number formatting for the landing page's animated figures.

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatDecimal(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
