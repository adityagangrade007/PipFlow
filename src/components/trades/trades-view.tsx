"use client";

import { ArrowDownRight, ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBots, useTrades } from "@/hooks/use-trading";
import { formatRelativeTime, formatSignedCurrency } from "@/lib/format";
import { SYMBOLS, type Trade, type TradeStatus } from "@/lib/types/trading";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function DirectionBadge({ direction }: { direction: Trade["direction"] }) {
  const Icon = direction === "BUY" ? ArrowUpRight : ArrowDownRight;
  return (
    <Badge variant="outline" className="gap-1 font-mono text-[11px]">
      <Icon className="size-3" aria-hidden />
      {direction}
    </Badge>
  );
}

function Pnl({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        value >= 0 ? "text-profit" : "text-loss"
      )}
    >
      {formatSignedCurrency(value)}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: Trade["closeReason"] }) {
  if (!reason) return null;
  const labels: Record<string, string> = {
    TP: "Take profit",
    SL: "Stop loss",
    TRAIL: "Trailing",
    MANUAL: "Manual",
  };
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[11px]",
        reason === "TP" && "text-profit",
        reason === "SL" && "text-loss"
      )}
    >
      {labels[reason]}
    </Badge>
  );
}

export function TradesView() {
  const [tab, setTab] = useState<TradeStatus>("OPEN");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [symbol, setSymbol] = useState("all");
  const [botId, setBotId] = useState("all");
  const [direction, setDirection] = useState("all");
  const [page, setPage] = useState(1);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter change resets pagination.
  useEffect(() => {
    setPage(1);
  }, [tab, q, symbol, botId, direction]);

  const { data: bots } = useBots();
  const { data, isPending, isError, error, isPlaceholderData } = useTrades({
    status: tab,
    q: q || undefined,
    symbol: symbol === "all" ? undefined : symbol,
    botId: botId === "all" ? undefined : botId,
    direction: direction === "all" ? undefined : direction,
    page,
    pageSize: PAGE_SIZE,
  });

  const hasFilters =
    q !== "" || symbol !== "all" || botId !== "all" || direction !== "all";
  const trades = data?.trades ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Trades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "OPEN"
              ? "Live positions — P&L updates every 5 seconds."
              : "Full trade history across all bots."}
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TradeStatus)}>
          <TabsList>
            <TabsTrigger value="OPEN">
              Open
              {tab === "OPEN" && data ? (
                <span className="ml-1 text-muted-foreground tabular-nums">
                  ({data.total})
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="CLOSED">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, bot, ticket…"
            className="pl-9"
            aria-label="Search trades"
          />
        </div>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-32" aria-label="Filter by symbol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All symbols</SelectItem>
            {SYMBOLS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={botId} onValueChange={setBotId}>
          <SelectTrigger className="w-40" aria-label="Filter by bot">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bots</SelectItem>
            {(bots ?? []).map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger className="w-28" aria-label="Filter by direction">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Buy & sell</SelectItem>
            <SelectItem value="BUY">Buy</SelectItem>
            <SelectItem value="SELL">Sell</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setSymbol("all");
              setBotId("all");
              setDirection("all");
            }}
          >
            <X className="size-3.5" aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>

      {/* Content */}
      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>Failed to load trades: {error.message}</AlertDescription>
        </Alert>
      ) : isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <EmptyState
          title={tab === "OPEN" ? "No open trades" : "No trades found"}
          description={
            hasFilters
              ? "Try adjusting or clearing the filters above."
              : tab === "OPEN"
                ? "Your bots will open positions when their strategies signal."
                : "Closed trades will appear here."
          }
        />
      ) : (
        <div className={cn(isPlaceholderData && "opacity-60 transition-opacity")}>
          {/* Desktop table */}
          <div className="hidden rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Symbol</TableHead>
                  <TableHead>Bot</TableHead>
                  <TableHead className="text-right">Lots</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">
                    {tab === "OPEN" ? "Current" : "Exit"}
                  </TableHead>
                  <TableHead className="text-right">Pips</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                  <TableHead className="text-right">
                    {tab === "OPEN" ? "Opened" : "Closed"}
                  </TableHead>
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
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {trade.currentPrice ?? trade.closePrice ?? "—"}
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
                      <div className="flex items-center justify-end gap-2">
                        {tab === "CLOSED" ? (
                          <ReasonBadge reason={trade.closeReason} />
                        ) : (
                          <span
                            className="size-1.5 animate-pulse rounded-full bg-profit"
                            aria-label="Live"
                          />
                        )}
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                          {formatRelativeTime(
                            tab === "OPEN"
                              ? trade.openedAt
                              : (trade.closedAt ?? trade.openedAt)
                          )}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-2.5 md:hidden">
            {trades.map((trade) => (
              <li key={trade.id} className="rounded-xl border bg-card p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {trade.symbol}
                    </span>
                    <DirectionBadge direction={trade.direction} />
                  </div>
                  <Pnl value={trade.profit} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">
                    {trade.bot} · {trade.lots.toFixed(2)} @ {trade.openPrice}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {tab === "CLOSED" ? <ReasonBadge reason={trade.closeReason} /> : null}
                    {formatRelativeTime(
                      tab === "OPEN" ? trade.openedAt : (trade.closedAt ?? trade.openedAt)
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && tab === "CLOSED" && data.total > PAGE_SIZE ? (
        <Pagination
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      ) : null}
    </div>
  );
}
