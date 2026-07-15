/**
 * Trading domain types, shared by the mock trading service, API routes and UI.
 * These mirror the future Prisma models / bridge payloads so the real data
 * layer can slot in without touching components.
 */

export const SYMBOLS = ["EURUSD", "XAUUSD", "GBPJPY", "USDJPY"] as const;
export type SymbolCode = (typeof SYMBOLS)[number];

export type TradeDirection = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED";
export type CloseReason = "TP" | "SL" | "TRAIL" | "MANUAL";
export type BotStatus = "RUNNING" | "PAUSED" | "STOPPED";

export interface Trade {
  id: string;
  ticket: number;
  botId: string;
  bot: string;
  symbol: SymbolCode;
  direction: TradeDirection;
  lots: number;
  openPrice: number;
  /** Only for OPEN trades. */
  currentPrice: number | null;
  /** Only for CLOSED trades. */
  closePrice: number | null;
  stopLoss: number;
  takeProfit: number;
  /** Net P&L including commission and swap. Floating for OPEN trades. */
  profit: number;
  pips: number;
  commission: number;
  swap: number;
  status: TradeStatus;
  closeReason: CloseReason | null;
  openedAt: string;
  closedAt: string | null;
}

export interface PricePoint {
  time: string;
  price: number;
}

export interface TradeWithPath extends Trade {
  pricePath: PricePoint[];
}

export interface BotConfig {
  riskPercent: number;
  lots: number;
  takeProfitPips: number;
  stopLossPips: number;
  dailyLossLimit: number;
  tradingHours: string;
  maxOpenTrades: number;
  magicNumber: number;
}

export interface BotStats {
  totalProfit: number;
  winRate: number;
  trades: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface Bot {
  id: string;
  name: string;
  strategy: string;
  symbol: SymbolCode;
  timeframe: string;
  status: BotStatus;
  startedAt: string;
  statusChangedAt: string;
  openTrades: number;
  floatingPnl: number;
  config: BotConfig;
  stats: BotStats;
  /** Cumulative P&L of the most recent trades, for sparklines. */
  sparkline: number[];
}

export const COMMAND_TYPES = [
  "START",
  "PAUSE",
  "RESUME",
  "RESTART",
  "EMERGENCY_STOP",
  "UPDATE_CONFIG",
] as const;
export type CommandType = (typeof COMMAND_TYPES)[number];

export type CommandStatus = "PENDING" | "ACKNOWLEDGED" | "EXECUTED" | "FAILED";

export interface BotCommand {
  id: string;
  botId: string;
  type: CommandType;
  payload: Partial<BotConfig> | null;
  status: CommandStatus;
  error: string | null;
  createdAt: string;
  executedAt: string | null;
}

export interface TradesQueryInput {
  status?: TradeStatus;
  q?: string;
  symbol?: SymbolCode;
  botId?: string;
  direction?: TradeDirection;
  page: number;
  pageSize: number;
}

export interface TradeListResult {
  trades: Trade[];
  total: number;
  page: number;
  pageCount: number;
}

export interface AccountSummary {
  balance: number;
  equity: number;
  floatingPnl: number;
  todayProfit: number;
  todayTrades: number;
  weekProfit: number;
  monthProfit: number;
  winRate: number;
  totalTrades: number;
  wonTrades: number;
  openTrades: number;
  runningBots: number;
  totalBots: number;
}

export interface AllocationSlice {
  symbol: SymbolCode;
  trades: number;
  profit: number;
  /** Share of total trade count, 0–100. */
  share: number;
}

export interface BotBreakdown {
  id: string;
  name: string;
  status: BotStatus;
  symbol: SymbolCode;
  trades: number;
  winRate: number;
  profit: number;
  /** Share of total absolute profit contribution, 0–100. */
  contribution: number;
}

export interface PortfolioData {
  account: AccountSummary;
  allocation: AllocationSlice[];
  bots: BotBreakdown[];
}
