import type {
  AccountSummary,
  AllocationSlice,
  Bot,
  BotBreakdown,
  BotStatus,
  CloseReason,
  PortfolioData,
  PricePoint,
  SymbolCode,
  Trade,
  TradeListResult,
  TradeWithPath,
  TradesQueryInput,
} from "@/lib/types/trading";
import {
  getCommandsVersion,
  getConfigOverride,
  getEffectiveState,
  getEmergencyStops,
} from "@/server/services/command-store";

/**
 * Mock Trading Service.
 *
 * A stateless, deterministic simulation: each bot's entire trade history is
 * procedurally generated from a fixed genesis date up to "now". Because the
 * timeline is a pure function of time + seed, it works on serverless (no DB,
 * no shared state), is identical across instances, and naturally produces
 * "live" behavior — open trades' floating P&L is re-sampled on a 5-second
 * tick, and new trades appear as time passes.
 *
 * This module implements the same contract the future simulation engine /
 * MetaTrader bridge will serve; only the implementation behind the API routes
 * changes when the real data layer arrives.
 */

const GENESIS = Date.UTC(2026, 3, 16); // Apr 16, 2026 — fixed timeline anchor
export const INITIAL_BALANCE = 40000;
const TICK_MS = 5000;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

interface SymbolMeta {
  digits: number;
  pipSize: number;
  /** USD per pip per 1.0 lot. */
  pipValue: number;
  base: number;
}

export const SYMBOL_META: Record<SymbolCode, SymbolMeta> = {
  EURUSD: { digits: 5, pipSize: 0.0001, pipValue: 10, base: 1.164 },
  XAUUSD: { digits: 2, pipSize: 0.1, pipValue: 10, base: 3340 },
  GBPJPY: { digits: 3, pipSize: 0.01, pipValue: 6.7, base: 198.4 },
  USDJPY: { digits: 3, pipSize: 0.01, pipValue: 6.4, base: 156.2 },
};

interface BotProfile {
  id: string;
  name: string;
  strategy: string;
  symbol: SymbolCode;
  timeframe: string;
  status: BotStatus;
  /** Hours the bot has been paused/stopped (ignored for RUNNING). */
  statusChangedHoursAgo: number;
  seed: number;
  magic: number;
  lots: number;
  /** Gap between trade opens, hours [min, max]. */
  gapH: [number, number];
  /** Trade duration, hours [min, max]. */
  durH: [number, number];
  winRate: number;
  winPips: [number, number];
  lossPips: [number, number];
  tpPips: number;
  slPips: number;
  riskPercent: number;
  dailyLossLimit: number;
  tradingHours: string;
  maxOpenTrades: number;
}

const BOT_PROFILES: BotProfile[] = [
  {
    id: "bot-aurora",
    name: "Aurora Scalper",
    strategy: "Scalping",
    symbol: "EURUSD",
    timeframe: "M5",
    status: "RUNNING",
    statusChangedHoursAgo: 0,
    seed: 101,
    magic: 20101,
    lots: 0.5,
    gapH: [2, 8],
    durH: [0.5, 3],
    winRate: 0.71,
    winPips: [6, 18],
    lossPips: [5, 14],
    tpPips: 20,
    slPips: 15,
    riskPercent: 1.0,
    dailyLossLimit: 400,
    tradingHours: "07:00–20:00",
    maxOpenTrades: 2,
  },
  {
    id: "bot-momentum",
    name: "Momentum Swing",
    strategy: "Trend following",
    symbol: "XAUUSD",
    timeframe: "H1",
    status: "RUNNING",
    statusChangedHoursAgo: 0,
    seed: 202,
    magic: 20102,
    lots: 0.2,
    gapH: [8, 24],
    durH: [12, 48],
    winRate: 0.57,
    winPips: [60, 240],
    lossPips: [70, 190],
    tpPips: 350,
    slPips: 200,
    riskPercent: 2.0,
    dailyLossLimit: 600,
    tradingHours: "00:00–24:00",
    maxOpenTrades: 2,
  },
  {
    id: "bot-grid",
    name: "Grid Master",
    strategy: "Grid",
    symbol: "GBPJPY",
    timeframe: "M15",
    status: "PAUSED",
    statusChangedHoursAgo: 2,
    seed: 303,
    magic: 20103,
    lots: 0.1,
    gapH: [1.5, 9],
    durH: [1, 9],
    winRate: 0.66,
    winPips: [15, 55],
    lossPips: [20, 80],
    tpPips: 60,
    slPips: 90,
    riskPercent: 1.5,
    dailyLossLimit: 200,
    tradingHours: "06:00–22:00",
    maxOpenTrades: 3,
  },
  {
    id: "bot-velocity",
    name: "Velocity Breakout",
    strategy: "Breakout",
    symbol: "USDJPY",
    timeframe: "M30",
    status: "RUNNING",
    statusChangedHoursAgo: 0,
    seed: 404,
    magic: 20104,
    lots: 0.3,
    gapH: [4, 12],
    durH: [4, 18],
    winRate: 0.52,
    winPips: [25, 90],
    lossPips: [20, 70],
    tpPips: 100,
    slPips: 70,
    riskPercent: 1.0,
    dailyLossLimit: 300,
    tradingHours: "12:00–21:00",
    maxOpenTrades: 1,
  },
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer hash → [0, 1). Used for time-ticked wobble on open trades. */
function hash01(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

interface PlannedTrade extends Trade {
  /** The pips outcome the trade is drifting toward (hidden from the API). */
  plannedPips: number;
  durationMs: number;
}

interface EffectiveBotState {
  status: BotStatus;
  changedAt: number;
  /** Executed emergency-stop timestamps — open positions force-close at these. */
  emergencyStops: number[];
}

/** Base profile state, overridden by executed remote commands. */
function effectiveState(profile: BotProfile, now: number): EffectiveBotState {
  const override = getEffectiveState(profile.id, now);
  const emergencyStops = getEmergencyStops(profile.id, now);
  if (override) {
    return { status: override.status, changedAt: override.at, emergencyStops };
  }
  return {
    status: profile.status,
    changedAt:
      profile.status === "RUNNING" ? GENESIS : now - profile.statusChangedHoursAgo * HOUR,
    emergencyStops,
  };
}

/** Effective status for a bot id — used by the command API for transition checks. */
export function getBotStatus(botId: string, now = Date.now()): BotStatus | null {
  const profile = BOT_PROFILES.find((p) => p.id === botId);
  if (!profile) return null;
  return effectiveState(profile, now).status;
}

/** Floating pips for an open trade at time `now` — drifts toward the planned
 *  outcome with a deterministic per-5s wobble so polling shows movement. */
function floatingPips(
  ticket: number,
  plannedPips: number,
  progress: number,
  now: number
): number {
  const tick = Math.floor(now / TICK_MS);
  const amp = Math.max(4, Math.abs(plannedPips) * 0.45) * (1 - 0.4 * progress);
  const wobble = (hash01(ticket * 7919 + tick) - 0.5) * 2 * amp;
  return plannedPips * progress * 0.85 + wobble;
}

function buildBotTrades(
  profile: BotProfile,
  now: number,
  eff: EffectiveBotState
): PlannedTrade[] {
  const meta = SYMBOL_META[profile.symbol];
  const rand = mulberry32(profile.seed);
  const trades: PlannedTrade[] = [];
  const openCutoff = eff.status === "RUNNING" ? now : eff.changedAt;

  let cursor = GENESIS + rand() * 6 * HOUR;
  let index = 0;

  for (;;) {
    const gap = (profile.gapH[0] + rand() * (profile.gapH[1] - profile.gapH[0])) * HOUR;
    const openTime = cursor + gap;
    if (openTime > Math.min(now, openCutoff)) break;

    const durationMs =
      (profile.durH[0] + rand() * (profile.durH[1] - profile.durH[0])) * HOUR;
    const closeTime = openTime + durationMs;
    const win = rand() < profile.winRate;
    const [lo, hi] = win ? profile.winPips : profile.lossPips;
    const plannedPips = (win ? 1 : -1) * (lo + rand() * (hi - lo));
    const direction = rand() < 0.5 ? "BUY" : "SELL";
    const dir = direction === "BUY" ? 1 : -1;

    const drift = Math.sin(index * 0.37 + profile.seed) * 0.012 + (rand() - 0.5) * 0.004;
    const openPrice = round(meta.base * (1 + drift), meta.digits);
    const ticket = profile.magic * 100 + index;
    // An emergency stop that lands inside this trade's lifetime closes it there.
    const stopAt = eff.emergencyStops.find(
      (s) => s >= openTime && s < closeTime && s <= now
    );
    const isOpen = stopAt === undefined && closeTime > now;
    const effectiveCloseTime = stopAt ?? closeTime;

    const durH = (isOpen ? durationMs : effectiveCloseTime - openTime) / HOUR;
    const commission = round(7 * profile.lots, 2);
    const swap = durH > 10 ? -round(0.6 * profile.lots * (durH / 24) * 10, 2) : 0;

    let pips: number;
    let currentPrice: number | null = null;
    let closePrice: number | null = null;
    let closeReason: CloseReason | null = null;

    if (isOpen) {
      const progress = Math.min(1, Math.max(0, (now - openTime) / durationMs));
      pips = round(floatingPips(ticket, plannedPips, progress, now), 1);
      currentPrice = round(openPrice + dir * pips * meta.pipSize, meta.digits);
    } else if (stopAt !== undefined) {
      // Force-closed at market by an emergency stop.
      const progress = Math.min(1, Math.max(0, (stopAt - openTime) / durationMs));
      pips = round(floatingPips(ticket, plannedPips, progress, stopAt), 1);
      closePrice = round(openPrice + dir * pips * meta.pipSize, meta.digits);
      closeReason = "MANUAL";
    } else {
      pips = round(plannedPips, 1);
      closePrice = round(openPrice + dir * pips * meta.pipSize, meta.digits);
      const r = rand();
      closeReason = win
        ? r < 0.7
          ? "TP"
          : r < 0.85
            ? "TRAIL"
            : "MANUAL"
        : r < 0.8
          ? "SL"
          : "MANUAL";
    }

    const gross = pips * meta.pipValue * profile.lots;
    const profit = round(gross - commission + swap, 2);

    trades.push({
      id: `t-${ticket}`,
      ticket,
      botId: profile.id,
      bot: profile.name,
      symbol: profile.symbol,
      direction,
      lots: profile.lots,
      openPrice,
      currentPrice,
      closePrice,
      stopLoss: round(openPrice - dir * profile.slPips * meta.pipSize, meta.digits),
      takeProfit: round(openPrice + dir * profile.tpPips * meta.pipSize, meta.digits),
      profit,
      pips,
      commission,
      swap,
      status: isOpen ? "OPEN" : "CLOSED",
      closeReason,
      openedAt: new Date(openTime).toISOString(),
      closedAt: isOpen ? null : new Date(effectiveCloseTime).toISOString(),
      plannedPips,
      durationMs,
    });

    cursor = openTime;
    index++;
  }

  return trades;
}

interface Timeline {
  trades: PlannedTrade[];
  byBot: Map<string, PlannedTrade[]>;
}

let timelineCache: { key: string; timeline: Timeline } | null = null;

function getTimeline(now: number): Timeline {
  // Cache per 5s tick AND per command-store version, so remote commands
  // (pause, emergency stop, …) take effect immediately.
  const key = `${Math.floor(now / TICK_MS)}:${getCommandsVersion()}`;
  if (timelineCache?.key === key) return timelineCache.timeline;

  const byBot = new Map<string, PlannedTrade[]>();
  const trades: PlannedTrade[] = [];
  for (const profile of BOT_PROFILES) {
    const botTrades = buildBotTrades(profile, now, effectiveState(profile, now));
    byBot.set(profile.id, botTrades);
    trades.push(...botTrades);
  }
  // Newest first: open trades by open time, then closed by close time.
  trades.sort((a, b) => {
    if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1;
    if (a.status === "OPEN") return b.openedAt.localeCompare(a.openedAt);
    return (b.closedAt ?? "").localeCompare(a.closedAt ?? "");
  });

  const timeline = { trades, byBot };
  timelineCache = { key, timeline };
  return timeline;
}

function toPublic(trade: PlannedTrade): Trade {
  const { plannedPips: _pips, durationMs: _dur, ...publicTrade } = trade;
  return publicTrade;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getTrades(query: TradesQueryInput, now = Date.now()): TradeListResult {
  const { trades } = getTimeline(now);
  const q = query.q?.trim().toLowerCase();

  const filtered = trades.filter((t) => {
    if (query.status && t.status !== query.status) return false;
    if (query.symbol && t.symbol !== query.symbol) return false;
    if (query.botId && t.botId !== query.botId) return false;
    if (query.direction && t.direction !== query.direction) return false;
    if (q) {
      const haystack = `${t.symbol} ${t.bot} ${t.ticket}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    trades: filtered.slice(start, start + query.pageSize).map(toPublic),
    total,
    page,
    pageCount,
  };
}

export function getTradeById(id: string, now = Date.now()): TradeWithPath | null {
  const { trades } = getTimeline(now);
  const trade = trades.find((t) => t.id === id);
  if (!trade) return null;
  return { ...toPublic(trade), pricePath: buildPricePath(trade, now) };
}

/** Deterministic intra-trade price path for the detail chart. */
function buildPricePath(trade: PlannedTrade, now: number): PricePoint[] {
  const meta = SYMBOL_META[trade.symbol];
  const dir = trade.direction === "BUY" ? 1 : -1;
  const openMs = new Date(trade.openedAt).getTime();
  const endMs = trade.closedAt ? new Date(trade.closedAt).getTime() : now;
  const span = Math.max(endMs - openMs, 60_000);
  const steps = 40;
  const finalPips = trade.pips;

  const points: PricePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const t = openMs + progress * span;
    let pips: number;
    if (i === 0) {
      pips = 0;
    } else if (i === steps) {
      pips = finalPips;
    } else {
      const amp = Math.max(3, Math.abs(finalPips) * 0.6) * (1 - 0.5 * progress);
      const wobble = (hash01(trade.ticket * 31 + i * 131) - 0.5) * 2 * amp;
      pips = finalPips * progress + wobble;
    }
    points.push({
      time: new Date(t).toISOString(),
      price: round(trade.openPrice + dir * pips * meta.pipSize, meta.digits),
    });
  }
  return points;
}

export function getBots(now = Date.now()): Bot[] {
  const { byBot } = getTimeline(now);

  return BOT_PROFILES.map((profile) => {
    const trades = byBot.get(profile.id) ?? [];
    const closed = trades.filter((t) => t.status === "CLOSED");
    const open = trades.filter((t) => t.status === "OPEN");
    const wins = closed.filter((t) => t.profit > 0);
    const grossWin = wins.reduce((s, t) => s + t.profit, 0);
    const grossLoss = Math.abs(
      closed.filter((t) => t.profit <= 0).reduce((s, t) => s + t.profit, 0)
    );

    // Max drawdown on the cumulative P&L curve.
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const curve: number[] = [];
    for (const t of [...closed].sort((a, b) =>
      (a.closedAt ?? "").localeCompare(b.closedAt ?? "")
    )) {
      cumulative += t.profit;
      curve.push(round(cumulative, 2));
      peak = Math.max(peak, cumulative);
      maxDrawdown = Math.max(maxDrawdown, peak - cumulative);
    }

    const eff = effectiveState(profile, now);

    return {
      id: profile.id,
      name: profile.name,
      strategy: profile.strategy,
      symbol: profile.symbol,
      timeframe: profile.timeframe,
      status: eff.status,
      startedAt: new Date(GENESIS).toISOString(),
      statusChangedAt: new Date(eff.changedAt).toISOString(),
      openTrades: open.length,
      floatingPnl: round(
        open.reduce((s, t) => s + t.profit, 0),
        2
      ),
      config: {
        riskPercent: profile.riskPercent,
        lots: profile.lots,
        takeProfitPips: profile.tpPips,
        stopLossPips: profile.slPips,
        dailyLossLimit: profile.dailyLossLimit,
        tradingHours: profile.tradingHours,
        maxOpenTrades: profile.maxOpenTrades,
        magicNumber: profile.magic,
        ...getConfigOverride(profile.id, now),
      },
      stats: {
        totalProfit: round(
          closed.reduce((s, t) => s + t.profit, 0),
          2
        ),
        winRate: closed.length ? round((wins.length / closed.length) * 100, 1) : 0,
        trades: closed.length,
        profitFactor: grossLoss > 0 ? round(grossWin / grossLoss, 2) : 0,
        maxDrawdown: round(maxDrawdown, 2),
      },
      sparkline: curve.slice(-40),
    };
  });
}

export function getAccountSummary(now = Date.now()): AccountSummary {
  const { trades } = getTimeline(now);
  const closed = trades.filter((t) => t.status === "CLOSED");
  const open = trades.filter((t) => t.status === "OPEN");

  const closedProfit = closed.reduce((s, t) => s + t.profit, 0);
  const floating = open.reduce((s, t) => s + t.profit, 0);
  const wins = closed.filter((t) => t.profit > 0).length;

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = now - 7 * DAY;
  const monthStart = now - 30 * DAY;

  const closedToday = closed.filter(
    (t) => new Date(t.closedAt ?? 0).getTime() >= dayStart.getTime()
  );
  const sumSince = (since: number) =>
    closed
      .filter((t) => new Date(t.closedAt ?? 0).getTime() >= since)
      .reduce((s, t) => s + t.profit, 0);

  return {
    balance: round(INITIAL_BALANCE + closedProfit, 2),
    equity: round(INITIAL_BALANCE + closedProfit + floating, 2),
    floatingPnl: round(floating, 2),
    todayProfit: round(
      closedToday.reduce((s, t) => s + t.profit, 0),
      2
    ),
    todayTrades: closedToday.length,
    weekProfit: round(sumSince(weekStart), 2),
    monthProfit: round(sumSince(monthStart), 2),
    winRate: closed.length ? round((wins / closed.length) * 100, 1) : 0,
    totalTrades: closed.length,
    wonTrades: wins,
    openTrades: open.length,
    runningBots: BOT_PROFILES.filter((b) => effectiveState(b, now).status === "RUNNING")
      .length,
    totalBots: BOT_PROFILES.length,
  };
}

/** Daily equity closes for the last `days` days (cumulative closed P&L). */
export function getEquitySeries(days: number, now = Date.now()) {
  const { trades } = getTimeline(now);
  const closed = trades
    .filter((t) => t.status === "CLOSED")
    .sort((a, b) => (a.closedAt ?? "").localeCompare(b.closedAt ?? ""));

  const series: { date: string; equity: number }[] = [];
  let cumulative = INITIAL_BALANCE;
  let idx = 0;
  for (let d = days - 1; d >= 0; d--) {
    const dayEnd = new Date(now - d * DAY);
    dayEnd.setHours(23, 59, 59, 999);
    while (
      idx < closed.length &&
      new Date(closed[idx].closedAt ?? 0).getTime() <= dayEnd.getTime()
    ) {
      cumulative += closed[idx].profit;
      idx++;
    }
    series.push({
      date: dayEnd.toISOString().slice(0, 10),
      equity: round(cumulative, 2),
    });
  }
  return series;
}

export function getDailyPnl(days: number, now = Date.now()) {
  const series = getEquitySeries(days + 1, now);
  return series.slice(1).map((point, i) => ({
    date: point.date,
    profit: round(point.equity - series[i].equity, 2),
  }));
}

export function getRecentTrades(limit: number, now = Date.now()): Trade[] {
  const { trades } = getTimeline(now);
  return trades.slice(0, limit).map(toPublic);
}

export function getPortfolio(now = Date.now()): PortfolioData {
  const account = getAccountSummary(now);
  const bots = getBots(now);

  const totalTrades = bots.reduce((s, b) => s + b.stats.trades, 0);
  const totalAbsProfit = bots.reduce((s, b) => s + Math.abs(b.stats.totalProfit), 0);

  const allocation: AllocationSlice[] = bots.map((bot) => ({
    symbol: bot.symbol,
    trades: bot.stats.trades,
    profit: bot.stats.totalProfit,
    share: totalTrades ? round((bot.stats.trades / totalTrades) * 100, 1) : 0,
  }));

  const breakdown: BotBreakdown[] = bots.map((bot) => ({
    id: bot.id,
    name: bot.name,
    status: bot.status,
    symbol: bot.symbol,
    trades: bot.stats.trades,
    winRate: bot.stats.winRate,
    profit: bot.stats.totalProfit,
    contribution: totalAbsProfit
      ? round((Math.abs(bot.stats.totalProfit) / totalAbsProfit) * 100, 1)
      : 0,
  }));

  return { account, allocation, bots: breakdown };
}
