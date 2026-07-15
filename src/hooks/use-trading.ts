"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type {
  Bot,
  PortfolioData,
  TradeListResult,
  TradeWithPath,
} from "@/lib/types/trading";

/** Poll cadence for "live" surfaces (matches the service's 5s tick). */
const LIVE_INTERVAL = 5_000;

export interface TradesFilter {
  status?: "OPEN" | "CLOSED";
  q?: string;
  symbol?: string;
  botId?: string;
  direction?: string;
  page?: number;
  pageSize?: number;
}

function toSearchParams(filter: TradesFilter): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function useTrades(filter: TradesFilter) {
  return useQuery({
    queryKey: ["trades", filter],
    queryFn: () => apiGet<TradeListResult>(`/api/trades?${toSearchParams(filter)}`),
    placeholderData: keepPreviousData,
    // Open trades tick every 5s; history only changes as trades close.
    refetchInterval: filter.status === "OPEN" ? LIVE_INTERVAL : 30_000,
  });
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: ["trade", id],
    queryFn: () => apiGet<TradeWithPath>(`/api/trades/${id}`),
    refetchInterval: (query) =>
      query.state.data?.status === "OPEN" ? LIVE_INTERVAL : false,
  });
}

export function useBots() {
  return useQuery({
    queryKey: ["bots"],
    queryFn: () => apiGet<Bot[]>("/api/bots"),
    refetchInterval: LIVE_INTERVAL * 3,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => apiGet<PortfolioData>("/api/portfolio"),
    refetchInterval: LIVE_INTERVAL,
  });
}
