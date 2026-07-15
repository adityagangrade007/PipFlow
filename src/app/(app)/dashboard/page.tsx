import type { Metadata } from "next";

import { DailyPnlChart } from "@/components/dashboard/daily-pnl-chart";
import { DistributionCard } from "@/components/dashboard/distribution-card";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { KpiCard, type KpiCardProps } from "@/components/dashboard/kpi-card";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { formatSignedCurrency } from "@/lib/format";
import { getDashboardData } from "@/lib/mock/dashboard";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const data = getDashboardData();
  const { account } = data;

  const floating = account.equity - account.balance;

  const kpis: KpiCardProps[] = [
    {
      label: "Balance",
      value: account.balance,
      kind: "currency",
      deltaPercent: 20.6,
      hint: "Past 90 days",
    },
    {
      label: "Equity",
      value: account.equity,
      kind: "currency",
      hint: `Incl. ${formatSignedCurrency(floating)} floating`,
    },
    {
      label: "Today's profit",
      value: account.todayProfit,
      kind: "signed-currency",
      deltaPercent: 0.7,
      hint: "12 trades today",
    },
    {
      label: "This week",
      value: account.weekProfit,
      kind: "signed-currency",
      hint: "102% of $1,250 target",
    },
    {
      label: "This month",
      value: account.monthProfit,
      kind: "signed-currency",
      deltaPercent: 8.8,
      hint: "Past 30 days",
    },
    {
      label: "Win rate",
      value: account.winRate,
      kind: "percent",
      hint: `${account.wonTrades} / ${account.totalTrades} trades`,
    },
    {
      label: "Open trades",
      value: account.openTrades,
      kind: "integer",
      hint: `${formatSignedCurrency(floating)} floating P&L`,
    },
    {
      label: "Running bots",
      value: account.runningBots,
      kind: "integer",
      suffix: `/ ${account.totalBots}`,
      hint: "Grid Master is paused",
    },
  ];

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your portfolio at a glance — 3 bots running, all systems nominal.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Equity + distribution */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        <EquityChart data={data.equitySeries} className="xl:col-span-2" />
        <DistributionCard
          distribution={data.distribution}
          totalTrades={account.totalTrades}
          wonTrades={account.wonTrades}
        />
      </div>

      {/* Daily P&L + recent trades */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        <DailyPnlChart data={data.dailyPnl} />
        <RecentTrades trades={data.recentTrades} className="xl:col-span-2" />
      </div>

      <RecentNotifications notifications={data.notifications} />
    </div>
  );
}
