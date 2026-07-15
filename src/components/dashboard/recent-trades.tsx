import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime, formatSignedCurrency } from "@/lib/format";
import type { Trade } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

function DirectionBadge({ direction }: { direction: Trade["direction"] }) {
  const Icon = direction === "BUY" ? ArrowUpRight : ArrowDownRight;
  return (
    <Badge variant="outline" className="gap-1 font-mono text-[11px]">
      <Icon className="size-3" aria-hidden />
      {direction}
    </Badge>
  );
}

function StatusCell({ trade }: { trade: Trade }) {
  if (trade.status === "OPEN") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-profit">
        <span className="size-1.5 animate-pulse rounded-full bg-profit" aria-hidden />
        Open
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground">
      {formatRelativeTime(trade.closedAt ?? trade.openedAt)}
    </span>
  );
}

function Pnl({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        value >= 0 ? "text-profit" : "text-loss",
        className
      )}
    >
      {formatSignedCurrency(value)}
    </span>
  );
}

export function RecentTrades({
  trades,
  className,
}: {
  trades: Trade[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Recent trades</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {trades.filter((t) => t.status === "OPEN").length} open ·{" "}
          {trades.filter((t) => t.status === "CLOSED").length} recently closed
        </p>
      </CardHeader>
      <CardContent>
        {/* Desktop: table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Symbol</TableHead>
                <TableHead>Bot</TableHead>
                <TableHead className="text-right">Lots</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Pips</TableHead>
                <TableHead className="text-right">P&amp;L</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {trade.symbol}
                      </span>
                      <DirectionBadge direction={trade.direction} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {trade.bot}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {trade.lots.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {trade.openPrice}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm tabular-nums",
                      trade.pips >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {trade.pips >= 0 ? "+" : "−"}
                    {Math.abs(trade.pips).toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Pnl value={trade.profit} />
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusCell trade={trade} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: cards */}
        <ul className="space-y-2.5 md:hidden">
          {trades.map((trade) => (
            <li key={trade.id} className="rounded-xl border bg-muted/30 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{trade.symbol}</span>
                  <DirectionBadge direction={trade.direction} />
                </div>
                <Pnl value={trade.profit} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="truncate">
                  {trade.bot} · {trade.lots.toFixed(2)} lots @ {trade.openPrice}
                </span>
                <StatusCell trade={trade} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
