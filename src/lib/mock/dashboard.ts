/**
 * Dashboard data adapter.
 *
 * Since the trading phase, all figures come from the mock trading service
 * (`src/server/services/mock-trading.ts`) so the dashboard, trades, bots and
 * portfolio pages always agree. This module only assembles the dashboard
 * view-model (server-side only — client components import types exclusively).
 */
import { formatSignedCurrency } from "@/lib/format";
import type { AccountSummary, Trade } from "@/lib/types/trading";
import {
  getAccountSummary,
  getDailyPnl,
  getEquitySeries,
  getPortfolio,
  getRecentTrades,
} from "@/server/services/mock-trading";

export type { Trade } from "@/lib/types/trading";

export type NotificationType =
  | "TRADE_OPENED"
  | "TRADE_CLOSED"
  | "RISK_ALERT"
  | "CONNECTION_LOST"
  | "PROFIT_TARGET"
  | "DAILY_REPORT";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

export interface DailyPnlPoint {
  date: string;
  profit: number;
}

export interface SymbolSlice {
  symbol: string;
  trades: number;
}

export interface DashboardData {
  account: AccountSummary;
  equitySeries: EquityPoint[];
  dailyPnl: DailyPnlPoint[];
  distribution: SymbolSlice[];
  recentTrades: Trade[];
  notifications: NotificationItem[];
}

const WEEKLY_TARGET = 1250;

function buildNotifications(
  account: AccountSummary,
  recentTrades: Trade[],
  now: Date
): NotificationItem[] {
  const iso = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60_000).toISOString();

  const lastOpen = recentTrades.find((t) => t.status === "OPEN");
  const lastClosed = recentTrades.find((t) => t.status === "CLOSED");
  const weekPct = Math.round((account.weekProfit / WEEKLY_TARGET) * 100);

  const notifications: NotificationItem[] = [];

  if (lastOpen) {
    notifications.push({
      id: `n-open-${lastOpen.id}`,
      type: "TRADE_OPENED",
      title: `Trade opened · ${lastOpen.symbol}`,
      body: `${lastOpen.bot} ${lastOpen.direction === "BUY" ? "bought" : "sold"} ${lastOpen.lots.toFixed(2)} lots at ${lastOpen.openPrice}.`,
      createdAt: lastOpen.openedAt,
      read: false,
    });
  }

  notifications.push({
    id: "n-target",
    type: "PROFIT_TARGET",
    title: weekPct >= 100 ? "Weekly profit target reached" : "Weekly profit update",
    body: `Portfolio is ${account.weekProfit >= 0 ? "up" : "down"} ${formatSignedCurrency(account.weekProfit)} this week — ${weekPct}% of your $1,250 target.`,
    createdAt: iso(5 * 60),
    read: false,
  });

  if (lastClosed) {
    notifications.push({
      id: `n-close-${lastClosed.id}`,
      type: "TRADE_CLOSED",
      title: `Trade closed · ${lastClosed.symbol}`,
      body: `${lastClosed.bot} closed ${lastClosed.lots.toFixed(2)} lots for ${formatSignedCurrency(lastClosed.profit)}${lastClosed.closeReason === "TP" ? " (take profit)" : lastClosed.closeReason === "SL" ? " (stop loss)" : ""}.`,
      createdAt: lastClosed.closedAt ?? iso(9 * 60),
      read: false,
    });
  }

  notifications.push(
    {
      id: "n-risk",
      type: "RISK_ALERT",
      title: "Risk alert · Grid Master",
      body: "Daily loss at 68% of the $200 limit. Bot pauses automatically at 100%.",
      createdAt: iso(14 * 60),
      read: true,
    },
    {
      id: "n-conn",
      type: "CONNECTION_LOST",
      title: "Connection restored · MT5-Live-02",
      body: "Bridge reconnected after 42s. All bots resumed and state synchronized.",
      createdAt: iso(26 * 60),
      read: true,
    },
    {
      id: "n-report",
      type: "DAILY_REPORT",
      title: "Daily report",
      body: `${account.todayTrades} trades closed today · ${formatSignedCurrency(account.todayProfit)} realized P&L.`,
      createdAt: iso(32 * 60),
      read: true,
    }
  );

  return notifications;
}

export function getDashboardData(now: Date = new Date()): DashboardData {
  const ts = now.getTime();
  const account = getAccountSummary(ts);
  const recentTrades = getRecentTrades(8, ts);
  const { allocation } = getPortfolio(ts);

  return {
    account,
    equitySeries: getEquitySeries(90, ts),
    dailyPnl: getDailyPnl(14, ts),
    distribution: allocation.map((slice) => ({
      symbol: slice.symbol,
      trades: slice.trades,
    })),
    recentTrades,
    notifications: buildNotifications(account, recentTrades, now),
  };
}

/** Extended feed for the notifications page — one entry per recent trade
 *  event plus the periodic system notifications. Newest first. */
export function getNotificationsFeed(now: Date = new Date()): NotificationItem[] {
  const ts = now.getTime();
  const account = getAccountSummary(ts);
  const trades = getRecentTrades(24, ts);

  const items: NotificationItem[] = trades.map((t) =>
    t.status === "OPEN"
      ? {
          id: `nf-open-${t.id}`,
          type: "TRADE_OPENED" as const,
          title: `Trade opened · ${t.symbol}`,
          body: `${t.bot} ${t.direction === "BUY" ? "bought" : "sold"} ${t.lots.toFixed(2)} lots at ${t.openPrice}.`,
          createdAt: t.openedAt,
          read: false,
        }
      : {
          id: `nf-close-${t.id}`,
          type: "TRADE_CLOSED" as const,
          title: `Trade closed · ${t.symbol}`,
          body: `${t.bot} closed ${t.lots.toFixed(2)} lots for ${formatSignedCurrency(t.profit)}${t.closeReason === "TP" ? " (take profit)" : t.closeReason === "SL" ? " (stop loss)" : ""}.`,
          createdAt: t.closedAt ?? t.openedAt,
          read: true,
        }
  );

  items.push(
    ...buildNotifications(account, trades, now).filter(
      (n) => !n.id.startsWith("n-open") && !n.id.startsWith("n-close")
    )
  );
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // The three most recent are unread, everything older has been seen.
  return items.map((n, i) => ({ ...n, read: i > 2 }));
}
