export function formatPeso(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  return `₱${amount.toLocaleString("en-PH")}`;
}
