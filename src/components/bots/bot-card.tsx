"use client";

import { BotConfigSheet } from "@/components/bots/bot-config-sheet";
import { BotControls, pendingCommandLabel } from "@/components/bots/bot-controls";
import { Sparkline } from "@/components/bots/sparkline";
import { BotStatusBadge } from "@/components/bots/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBotCommand } from "@/hooks/use-bot-command";
import {
  formatCurrency,
  formatPercent,
  formatRelativeTime,
  formatSignedCurrency,
} from "@/lib/format";
import type { Bot } from "@/lib/types/trading";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-mono text-sm font-semibold tabular-nums",
          tone === "profit" && "text-profit",
          tone === "loss" && "text-loss"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function BotCard({ bot }: { bot: Bot }) {
  const mutation = useBotCommand(bot.id);
  const pendingLabel = pendingCommandLabel(mutation);
  const profitable = bot.stats.totalProfit >= 0;

  return (
    <Card className="gap-4">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {bot.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {bot.strategy}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {bot.symbol} · {bot.timeframe} · #{bot.config.magicNumber}
          </p>
        </div>
        <BotStatusBadge status={bot.status} pendingLabel={pendingLabel} />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total P&amp;L</p>
            <p
              className={cn(
                "font-mono text-2xl font-semibold tracking-tight tabular-nums",
                profitable ? "text-profit" : "text-loss"
              )}
            >
              {formatSignedCurrency(bot.stats.totalProfit)}
            </p>
          </div>
          <Sparkline data={bot.sparkline} positive={profitable} />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <Stat label="Win rate" value={formatPercent(bot.stats.winRate)} />
          <Stat label="Trades" value={String(bot.stats.trades)} />
          <Stat label="Profit factor" value={bot.stats.profitFactor.toFixed(2)} />
          <Stat label="Max DD" value={formatCurrency(bot.stats.maxDrawdown)} />
          <Stat
            label={`Floating (${bot.openTrades})`}
            value={formatSignedCurrency(bot.floatingPnl)}
            tone={
              bot.openTrades === 0 ? undefined : bot.floatingPnl >= 0 ? "profit" : "loss"
            }
          />
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Risk {bot.config.riskPercent}%</span>
          <span>·</span>
          <span>{bot.config.lots.toFixed(2)} lots</span>
          <span>·</span>
          <span>
            TP {bot.config.takeProfitPips} / SL {bot.config.stopLossPips} pips
          </span>
          <span>·</span>
          <span>Daily loss {formatCurrency(bot.config.dailyLossLimit)}</span>
          <span>·</span>
          <span>{bot.config.tradingHours}</span>
          <span>·</span>
          <span>Max {bot.config.maxOpenTrades} trades</span>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <BotControls bot={bot} mutation={mutation} />
          <BotConfigSheet bot={bot} mutation={mutation} />
        </div>

        <p className="text-xs text-muted-foreground">
          {bot.status === "RUNNING"
            ? `Running since ${new Date(bot.statusChangedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : `${bot.status === "PAUSED" ? "Paused" : "Stopped"} ${formatRelativeTime(bot.statusChangedAt)}`}
        </p>
      </CardContent>
    </Card>
  );
}
