import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

type Point = readonly [number, number];

/** Converts points to a smooth cubic-bezier path (Catmull-Rom). */
function smoothPath(points: Point[]): string {
  if (points.length < 2) return "";
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${r(points[0][0])},${r(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

const CHART = { width: 560, height: 170, padX: 4, padY: 14 };

// 30 days of simulated equity, indexed 0–100.
const EQUITY_SERIES = [
  18, 22, 20, 26, 24, 30, 28, 27, 34, 38, 35, 42, 40, 47, 44, 43, 52, 56, 53, 61, 58, 66,
  63, 71, 75, 72, 80, 85, 82, 92,
];

const points: Point[] = EQUITY_SERIES.map((v, i) => [
  CHART.padX + (i / (EQUITY_SERIES.length - 1)) * (CHART.width - CHART.padX * 2),
  CHART.height - CHART.padY - (v / 100) * (CHART.height - CHART.padY * 2),
]);

const linePath = smoothPath(points);
const lastPoint = points[points.length - 1];
const areaPath = `${linePath} L ${CHART.width - CHART.padX},${CHART.height} L ${CHART.padX},${CHART.height} Z`;

const stats = [
  { label: "Balance", value: "$128,420.16", delta: "+2.4%", positive: true },
  { label: "Equity", value: "$131,204.52", delta: "+4.1%", positive: true },
  { label: "Today's P/L", value: "+$1,284.02", delta: "12 trades", positive: true },
  { label: "Win rate", value: "68.4%", delta: "30 days", positive: true },
];

const bots = [
  {
    name: "Aurora Scalper",
    market: "EURUSD · M5",
    status: "Running",
    pnl: "+$412.20",
    positive: true,
  },
  {
    name: "Momentum Swing",
    market: "XAUUSD · H1",
    status: "Running",
    pnl: "+$871.10",
    positive: true,
  },
  {
    name: "Grid Master",
    market: "GBPJPY · M15",
    status: "Paused",
    pnl: "-$63.44",
    positive: false,
  },
];

function EquityChart() {
  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      role="img"
      aria-label="Simulated equity curve trending upward over the past 30 days"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={CHART.padX}
          x2={CHART.width - CHART.padX}
          y1={CHART.height * t}
          y2={CHART.height * t}
          stroke="var(--color-border)"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#equity-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="4.5"
        fill="var(--color-primary)"
        stroke="var(--color-card)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Ambient glow behind the panel */}
      <div
        aria-hidden
        className="absolute inset-x-8 top-8 -z-10 h-3/4 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-border/60">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[oklch(0.68_0.19_25)]/80" />
            <span className="size-2.5 rounded-full bg-[oklch(0.8_0.14_85)]/80" />
            <span className="size-2.5 rounded-full bg-[oklch(0.72_0.15_155)]/80" />
          </div>
          <div className="mx-auto hidden items-center gap-1.5 rounded-md border bg-background px-3 py-1 font-mono text-xs text-muted-foreground sm:flex">
            <Activity className="size-3" />
            app.pipflow.com/dashboard
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Portfolio overview</h3>
              <p className="text-xs text-muted-foreground">3 bots · 2 running</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-profit">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-profit" />
              </span>
              Live
            </span>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums sm:text-base">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs tabular-nums",
                    stat.positive ? "text-profit" : "text-loss"
                  )}
                >
                  {stat.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Equity curve */}
          <div className="rounded-xl border p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Equity curve</p>
              <p className="text-xs font-semibold text-profit tabular-nums">
                +18.2% past 30 days
              </p>
            </div>
            <EquityChart />
          </div>

          {/* Bot list */}
          <ul className="divide-y rounded-xl border">
            {bots.map((bot) => (
              <li
                key={bot.name}
                className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      bot.status === "Running"
                        ? "animate-pulse bg-profit"
                        : "bg-muted-foreground/50"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{bot.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {bot.market}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {bot.status}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      bot.positive ? "text-profit" : "text-loss"
                    )}
                  >
                    {bot.pnl}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
