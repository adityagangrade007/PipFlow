"use client";

interface ChartTooltipRow {
  name: string;
  value: string;
  /** CSS color for the identity dot; omit for single-series charts. */
  color?: string;
}

interface ChartTooltipContentProps {
  title?: string;
  rows: ChartTooltipRow[];
}

/** Shared tooltip surface for all Recharts tooltips — values in text ink. */
export function ChartTooltipContent({ title, rows }: ChartTooltipContentProps) {
  return (
    <div className="min-w-36 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {title ? (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
      ) : null}
      {rows.map((row) => (
        <div key={row.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-xs">
            {row.color ? (
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            ) : null}
            {row.name}
          </span>
          <span className="text-xs font-semibold tabular-nums">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
