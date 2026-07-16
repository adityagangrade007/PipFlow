import type { Metadata } from "next";

import { MonthlyPnlChart } from "@/components/analytics/monthly-pnl-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAnalytics } from "@/server/services/mock-trading";

export const metadata: Metadata = {
  title: "Analytics",
};

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
  hint?: string;
}) {
  return (
    <Card className="py-0">
      <CardContent className="p-4 sm:p-5">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        <p
          className={cn(
            "mt-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
            tone === "profit" && "text-profit",
            tone === "loss" && "text-loss"
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const a = getAnalytics();

  const stats = [
    {
      label: "Total P&L",
      value: formatSignedCurrency(a.totalProfit),
      tone: a.totalProfit >= 0 ? ("profit" as const) : ("loss" as const),
      hint: `${a.totalTrades.toLocaleString("en-US")} closed trades`,
    },
    {
      label: "Win rate",
      value: formatPercent(a.winRate),
      hint: "All bots, 90 days",
    },
    {
      label: "Profit factor",
      value: a.profitFactor.toFixed(2),
      hint: "Gross win / gross loss",
    },
    {
      label: "Max drawdown",
      value: formatCurrency(a.maxDrawdown),
      hint: "Peak-to-trough, realized",
    },
    {
      label: "Best day",
      value: formatSignedCurrency(a.bestDay.profit),
      tone: "profit" as const,
      hint: new Date(`${a.bestDay.date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    },
    {
      label: "Worst day",
      value: formatSignedCurrency(a.worstDay.profit),
      tone: "loss" as const,
      hint: new Date(`${a.worstDay.date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance across all strategies — realized results, last 90 days.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <MonthlyPnlChart data={a.monthly} />

        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Performance by symbol</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Averages are per closed trade
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win rate</TableHead>
                  <TableHead className="text-right">Avg trade</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.bySymbol.map((row) => (
                  <TableRow key={row.symbol}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {row.symbol}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {row.trades}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatPercent(row.winRate)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm tabular-nums",
                        row.avgTrade >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {formatSignedCurrency(row.avgTrade)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm font-semibold tabular-nums",
                        row.profit >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {formatSignedCurrency(row.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
