const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return usd.format(value);
}

export function formatCurrencyCompact(value: number): string {
  return usdCompact.format(value);
}

/** "+$1,284.02" / "−$63.44" — P&L is always explicitly signed, never color-alone. */
export function formatSignedCurrency(value: number): string {
  const formatted = usd.format(Math.abs(value));
  return value < 0 ? `−${formatted}` : `+${formatted}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  return `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(digits)}%`;
}

/** Compact relative time: "2m ago", "3h ago", "5d ago". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "Jul 14, 09:42" — fixed locale so server and client always agree. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
