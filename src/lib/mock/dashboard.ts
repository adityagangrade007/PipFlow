/**
 * Deterministic mock data for the dashboard.
 *
 * Shaped like the future bridge/API responses (see the architecture blueprint)
 * so that swapping in the real data layer only changes how these values are
 * fetched, not how they are rendered. All figures are internally consistent:
 * equity − balance equals the floating P&L of open trades, the distribution
 * counts sum to the total trade count behind the win rate, and the daily P&L
 * bars are derived from the equity series.
 */

export type TradeDirection = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED";

export interface Trade {
  id: string;
  bot: string;
  symbol: string;
  direction: TradeDirection;
  lots: number;
  openPrice: number;
  closePrice: number | null;
  profit: number;
  pips: number;
  status: TradeStatus;
  openedAt: string;
  closedAt: string | null;
}

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
  date: string; // ISO date (day granularity)
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
  account: {
    balance: number;
    equity: number;
    todayProfit: number;
    weekProfit: number;
    monthProfit: number;
    winRate: number;
    totalTrades: number;
    wonTrades: number;
    openTrades: number;
    runningBots: number;
    totalBots: number;
  };
  equitySeries: EquityPoint[];
  dailyPnl: DailyPnlPoint[];
  distribution: SymbolSlice[];
  recentTrades: Trade[];
  notifications: NotificationItem[];
}

/** Small deterministic PRNG so the series is identical on every render. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BALANCE = 48236.87;
const FLOATING_PNL = 674.47; // sum of open-trade P&L below
const EQUITY = BALANCE + FLOATING_PNL;
const START_EQUITY = 40000;
const DAYS = 90;

function buildEquitySeries(now: Date): EquityPoint[] {
  const rand = mulberry32(7);
  // Random walk with mild upward drift and a few losing streaks.
  const raw: number[] = [START_EQUITY];
  for (let i = 1; i < DAYS; i++) {
    const streak = i % 17 < 4 ? -0.004 : 0.0035; // periodic drawdown phases
    const shock = (rand() - 0.5) * 0.018;
    raw.push(raw[i - 1] * (1 + streak + shock));
  }
  // Rescale so the curve lands exactly on today's equity.
  const scale = (EQUITY - START_EQUITY) / (raw[DAYS - 1] - START_EQUITY);
  return raw.map((v, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (DAYS - 1 - i));
    return {
      date: date.toISOString().slice(0, 10),
      equity: Math.round((START_EQUITY + (v - START_EQUITY) * scale) * 100) / 100,
    };
  });
}

function buildDailyPnl(series: EquityPoint[]): DailyPnlPoint[] {
  return series.slice(-15).flatMap((point, i, window) => {
    if (i === 0) return [];
    return [
      {
        date: point.date,
        profit: Math.round((point.equity - window[i - 1].equity) * 100) / 100,
      },
    ];
  });
}

function iso(now: Date, minutesAgo: number): string {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

export function getDashboardData(now: Date = new Date()): DashboardData {
  const equitySeries = buildEquitySeries(now);
  const dailyPnl = buildDailyPnl(equitySeries);

  const recentTrades: Trade[] = [
    {
      id: "t-88412",
      bot: "Momentum Swing",
      symbol: "XAUUSD",
      direction: "BUY",
      lots: 0.2,
      openPrice: 3341.6,
      closePrice: null,
      profit: 412.2,
      pips: 206.1,
      status: "OPEN",
      openedAt: iso(now, 26 * 60),
      closedAt: null,
    },
    {
      id: "t-88409",
      bot: "Aurora Scalper",
      symbol: "EURUSD",
      direction: "BUY",
      lots: 0.5,
      openPrice: 1.1642,
      closePrice: null,
      profit: 295.92,
      pips: 59.2,
      status: "OPEN",
      openedAt: iso(now, 7 * 60),
      closedAt: null,
    },
    {
      id: "t-88405",
      bot: "Grid Master",
      symbol: "GBPJPY",
      direction: "SELL",
      lots: 0.1,
      openPrice: 198.442,
      closePrice: null,
      profit: -33.65,
      pips: -50.4,
      status: "OPEN",
      openedAt: iso(now, 3 * 60),
      closedAt: null,
    },
    {
      id: "t-88398",
      bot: "Aurora Scalper",
      symbol: "EURUSD",
      direction: "SELL",
      lots: 0.5,
      openPrice: 1.1691,
      closePrice: 1.1668,
      profit: 115.0,
      pips: 23.0,
      status: "CLOSED",
      openedAt: iso(now, 11 * 60),
      closedAt: iso(now, 9 * 60),
    },
    {
      id: "t-88396",
      bot: "Momentum Swing",
      symbol: "USDJPY",
      direction: "BUY",
      lots: 0.3,
      openPrice: 156.212,
      closePrice: 156.531,
      profit: 61.14,
      pips: 31.9,
      status: "CLOSED",
      openedAt: iso(now, 21 * 60),
      closedAt: iso(now, 13 * 60),
    },
    {
      id: "t-88391",
      bot: "Grid Master",
      symbol: "GBPJPY",
      direction: "SELL",
      lots: 0.1,
      openPrice: 198.126,
      closePrice: 198.507,
      profit: -25.42,
      pips: -38.1,
      status: "CLOSED",
      openedAt: iso(now, 30 * 60),
      closedAt: iso(now, 22 * 60),
    },
    {
      id: "t-88387",
      bot: "Aurora Scalper",
      symbol: "EURUSD",
      direction: "BUY",
      lots: 0.5,
      openPrice: 1.1604,
      closePrice: 1.1639,
      profit: 175.0,
      pips: 35.0,
      status: "CLOSED",
      openedAt: iso(now, 34 * 60),
      closedAt: iso(now, 31 * 60),
    },
    {
      id: "t-88380",
      bot: "Momentum Swing",
      symbol: "XAUUSD",
      direction: "SELL",
      lots: 0.15,
      openPrice: 3358.4,
      closePrice: 3349.1,
      profit: 139.5,
      pips: 93.0,
      status: "CLOSED",
      openedAt: iso(now, 47 * 60),
      closedAt: iso(now, 38 * 60),
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: "n-2041",
      type: "TRADE_OPENED",
      title: "Trade opened · GBPJPY",
      body: "Grid Master sold 0.10 lots at 198.442.",
      createdAt: iso(now, 3 * 60),
      read: false,
    },
    {
      id: "n-2040",
      type: "PROFIT_TARGET",
      title: "Weekly profit target reached",
      body: "Portfolio is up +$1,284.02 this week — 102% of your $1,250 target.",
      createdAt: iso(now, 5 * 60),
      read: false,
    },
    {
      id: "n-2039",
      type: "TRADE_CLOSED",
      title: "Trade closed · EURUSD",
      body: "Aurora Scalper closed 0.50 lots for +$115.00 (take profit).",
      createdAt: iso(now, 9 * 60),
      read: false,
    },
    {
      id: "n-2038",
      type: "RISK_ALERT",
      title: "Risk alert · Grid Master",
      body: "Daily loss at 68% of the $200 limit. Bot pauses automatically at 100%.",
      createdAt: iso(now, 14 * 60),
      read: true,
    },
    {
      id: "n-2037",
      type: "CONNECTION_LOST",
      title: "Connection restored · MT5-Live-02",
      body: "Bridge reconnected after 42s. All bots resumed and state synchronized.",
      createdAt: iso(now, 26 * 60),
      read: true,
    },
    {
      id: "n-2036",
      type: "DAILY_REPORT",
      title: "Daily report — Monday",
      body: "12 trades · 8 wins · +$342.18. Best bot: Momentum Swing (+$212.90).",
      createdAt: iso(now, 32 * 60),
      read: true,
    },
  ];

  return {
    account: {
      balance: BALANCE,
      equity: EQUITY,
      todayProfit: 342.18,
      weekProfit: 1284.02,
      monthProfit: 3918.44,
      winRate: 67.3,
      totalTrades: 211,
      wonTrades: 142,
      openTrades: 3,
      runningBots: 3,
      totalBots: 4,
    },
    equitySeries,
    dailyPnl,
    // Fixed order — assigned to categorical colors chart-1…chart-5 in this order.
    distribution: [
      { symbol: "EURUSD", trades: 72 },
      { symbol: "XAUUSD", trades: 54 },
      { symbol: "GBPJPY", trades: 38 },
      { symbol: "USDJPY", trades: 26 },
      { symbol: "Other", trades: 21 },
    ],
    recentTrades,
    notifications,
  };
}
