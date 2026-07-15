"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type KpiKind = "currency" | "signed-currency" | "percent" | "integer";

const formatters: Record<KpiKind, (n: number) => string> = {
  currency: formatCurrency,
  "signed-currency": formatSignedCurrency,
  percent: (n) => formatPercent(n),
  integer: (n) => Math.round(n).toString(),
};

export interface KpiCardProps {
  label: string;
  value: number;
  kind: KpiKind;
  /** Rendered after the value, e.g. "/ 4" for "3 / 4 bots". */
  suffix?: string;
  /** Signed percentage change shown as a trend badge. */
  deltaPercent?: number;
  hint?: string;
}

export function KpiCard({
  label,
  value,
  kind,
  suffix,
  deltaPercent,
  hint,
}: KpiCardProps) {
  // Signed P&L values are also toned by sign — sign symbol carries the meaning,
  // color only reinforces it.
  const toned = kind === "signed-currency";
  const negative = value < 0;

  return (
    <Card className="py-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          {deltaPercent !== undefined ? (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums",
                deltaPercent >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {deltaPercent >= 0 ? (
                <TrendingUp className="size-3.5" aria-hidden />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden />
              )}
              {formatSignedPercent(deltaPercent)}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-2 text-xl font-semibold tracking-tight sm:text-2xl",
            toned && (negative ? "text-loss" : "text-profit")
          )}
        >
          <AnimatedNumber value={value} format={formatters[kind]} />
          {suffix ? (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
        {hint ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
