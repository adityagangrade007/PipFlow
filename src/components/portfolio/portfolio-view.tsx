"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "@/hooks/use-trading";
import { formatPercent, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const SLICE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

const STATUS_DOT: Record<string, string> = {
  RUNNING: "bg-profit animate-pulse",
  PAUSED: "bg-[var(--color-chart-4)]",
  STOPPED: "bg-loss",
};

export function PortfolioView() {
  const { data, isPending, isError, error } = usePortfolio();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load portfolio: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const { account, allocation, bots } = data;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate exposure and contribution across all bots — live.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Balance" value={account.balance} kind="currency" />
        <KpiCard
          label="Equity"
          value={account.equity}
          kind="currency"
          hint={`${account.openTrades} open trades`}
        />
        <KpiCard
          label="Floating P&L"
          value={account.floatingPnl}
          kind="signed-currency"
        />
        <KpiCard
          label="This month"
          value={account.monthProfit}
          kind="signed-currency"
          hint="Realized, past 30 days"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        {/* Allocation by symbol */}
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Allocation by symbol</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Share of total trade volume · 90 days
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocation.map((slice, i) => (
              <div key={slice.symbol}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
                    />
                    <span className="font-mono font-semibold">{slice.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {slice.trades} trades
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold tabular-nums",
                      slice.profit >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {formatSignedCurrency(slice.profit)}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${slice.symbol}: ${slice.share}% of trades`}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${slice.share}%`,
                      backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Per-bot contribution */}
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Bot contribution</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Realized P&L contribution per strategy
            </p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {bots.map((bot) => (
                <li
                  key={bot.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        STATUS_DOT[bot.status]
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{bot.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bot.symbol} · {bot.trades} trades · {formatPercent(bot.winRate)}{" "}
                        win rate
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "font-mono text-sm font-semibold tabular-nums",
                        bot.profit >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {formatSignedCurrency(bot.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatPercent(bot.contribution, 0)} of P&L
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
