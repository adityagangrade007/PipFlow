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
import type { MonthlyPnlPoint } from "@/lib/types/trading";

interface MonthlyTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string }>;
}

function MonthlyTooltip({ active, label, payload }: MonthlyTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContent
      title={String(label)}
      rows={[{ name: "P&L", value: formatSignedCurrency(Number(payload[0].value)) }]}
    />
  );
}

export function MonthlyPnlChart({ data }: { data: MonthlyPnlPoint[] }) {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Monthly P&amp;L</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Realized, last 4 months</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                width={48}
                tickFormatter={(v: number) => formatCurrencyCompact(v)}
                tickLine={false}
                axisLine={false}
                tickCount={5}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                content={<MonthlyTooltip />}
                cursor={{ fill: "var(--color-muted)" }}
              />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar dataKey="profit" radius={[3, 3, 3, 3]} maxBarSize={48}>
                {data.map((point) => (
                  <Cell
                    key={point.month}
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
