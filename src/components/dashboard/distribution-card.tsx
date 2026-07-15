"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import type { SymbolSlice } from "@/lib/mock/dashboard";

// Fixed categorical assignment — slice order never repaints on filtering.
const SLICE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface DistributionTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string | number;
    value?: number | string;
    payload?: { fill?: string };
  }>;
}

export function DistributionCard({
  distribution,
  totalTrades,
  wonTrades,
  className,
}: {
  distribution: SymbolSlice[];
  totalTrades: number;
  wonTrades: number;
  className?: string;
}) {
  const lostTrades = totalTrades - wonTrades;
  const winShare = (wonTrades / totalTrades) * 100;

  function DistributionTooltip({ active, payload }: DistributionTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const trades = Number(entry.value);
    return (
      <ChartTooltipContent
        rows={[
          {
            name: String(entry.name),
            value: `${trades} trades · ${formatPercent((trades / totalTrades) * 100, 0)}`,
            color: entry.payload?.fill,
          },
        ]}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Trade distribution</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">By symbol · last 90 days</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="relative mx-auto h-[190px] w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<DistributionTooltip />} />
              <Pie
                data={distribution}
                dataKey="trades"
                nameKey="symbol"
                innerRadius="68%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="var(--color-card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {distribution.map((slice, i) => (
                  <Cell key={slice.symbol} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {totalTrades}
            </span>
            <span className="text-xs text-muted-foreground">trades</span>
          </div>
        </div>

        {/* Legend — identity is never color-alone */}
        <ul className="space-y-2">
          {distribution.map((slice, i) => (
            <li
              key={slice.symbol}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                <span className="font-medium">{slice.symbol}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                {slice.trades} · {formatPercent((slice.trades / totalTrades) * 100, 0)}
              </span>
            </li>
          ))}
        </ul>

        {/* Win / loss split */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-profit">{wonTrades} wins</span>
            <span className="text-loss">{lostTrades} losses</span>
          </div>
          <div
            role="img"
            aria-label={`${wonTrades} winning and ${lostTrades} losing trades`}
            className="mt-1.5 flex h-2 gap-0.5 overflow-hidden rounded-full"
          >
            <div className="rounded-full bg-profit" style={{ width: `${winShare}%` }} />
            <div className="flex-1 rounded-full bg-loss" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
