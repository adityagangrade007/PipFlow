"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyCompact, formatSignedCurrency } from "@/lib/format";
import type { DailyPnlPoint } from "@/lib/mock/dashboard";

function formatTick(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface PnlTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string }>;
}

function PnlTooltip({ active, label, payload }: PnlTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContent
      title={formatTick(String(label))}
      rows={[{ name: "P&L", value: formatSignedCurrency(Number(payload[0].value)) }]}
    />
  );
}

export function DailyPnlChart({
  data,
  className,
}: {
  data: DailyPnlPoint[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.profit, 0);

  return (
    <Card className={className}>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Daily P&amp;L</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 14 days ·{" "}
          <span
            className={`font-semibold tabular-nums ${total >= 0 ? "text-profit" : "text-loss"}`}
          >
            {formatSignedCurrency(total)}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                width={44}
                tickFormatter={(v: number) => formatCurrencyCompact(v)}
                tickLine={false}
                axisLine={false}
                tickCount={5}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip content={<PnlTooltip />} cursor={{ fill: "var(--color-muted)" }} />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar dataKey="profit" radius={[3, 3, 3, 3]} maxBarSize={22}>
                {data.map((point) => (
                  <Cell
                    key={point.date}
                    fill={point.profit >= 0 ? "var(--color-profit)" : "var(--color-loss)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
