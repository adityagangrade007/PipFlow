/** Tiny cumulative-P&L sparkline (single series, no axes — the stat row
 *  beside it carries the numbers). */
export function Sparkline({
  data,
  positive,
  width = 120,
  height = 36,
}: {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data, 0);
  const max = Math.max(...data, 0);
  const span = max - min || 1;
  const pad = 2;

  const points = data
    .map((value, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (value - min) / span) * (height - pad * 2);
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-9 w-full max-w-[120px]"
      role="img"
      aria-label={`Cumulative profit trend, ${positive ? "positive" : "negative"} overall`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--color-profit)" : "var(--color-loss)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
