"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCurrencyCompact, formatSignedPercent } from "@/lib/format";
import type { EquityPoint } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function formatTick(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface EquityTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string }>;
}

function EquityTooltip({ active, label, payload }: EquityTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContent
      title={formatTick(String(label))}
      rows={[{ name: "Equity", value: formatCurrency(Number(payload[0].value)) }]}
    />
  );
}

export function EquityChart({
  data,
  className,
}: {
  data: EquityPoint[];
  className?: string;
}) {
  const [range, setRange] = useState<RangeKey>("1M");

  const visible = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 30;
    return data.slice(-days);
  }, [data, range]);

  const first = visible[0]?.equity ?? 0;
  const last = visible[visible.length - 1]?.equity ?? 0;
  const changePercent = first ? ((last - first) / first) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">Equity curve</CardTitle>
          <p
            className={cn(
              "mt-1 text-sm font-semibold tabular-nums",
              changePercent >= 0 ? "text-profit" : "text-loss"
            )}
          >
            {formatSignedPercent(changePercent)}{" "}
            <span className="font-normal text-muted-foreground">
              past {range === "1W" ? "week" : range === "1M" ? "month" : "3 months"}
            </span>
          </p>
        </div>
        <div className="flex rounded-lg bg-muted p-0.5" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.key}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visible} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="equity-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                minTickGap={48}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                width={52}
                domain={["dataMin - 400", "dataMax + 400"]}
                tickFormatter={(v: number) => formatCurrencyCompact(v)}
                tickLine={false}
                axisLine={false}
                tickCount={5}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                content={<EquityTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#equity-area)"
                activeDot={{
                  r: 4,
                  fill: "var(--color-primary)",
                  stroke: "var(--color-card)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
