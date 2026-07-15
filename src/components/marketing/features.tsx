import {
  Activity,
  Bell,
  Gauge,
  Lock,
  Pause,
  Play,
  Square,
  TrendingUp,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

function ControlsVisual() {
  return (
    <div className="mt-6 rounded-xl border bg-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
          <Play className="size-3.5 text-profit" /> Start
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
          <Pause className="size-3.5" /> Pause
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
          <Square className="size-3.5" /> Restart
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
          Emergency stop
        </span>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        <span className="text-profit">✓</span> Command acknowledged · 42 ms
      </p>
    </div>
  );
}

function AlertsVisual() {
  return (
    <div className="mt-6 space-y-2">
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="text-xs font-semibold">Trade closed · EURUSD</p>
        <p className="mt-0.5 font-mono text-xs text-profit tabular-nums">
          +$127.40 · TP hit
        </p>
      </div>
      <div className="rounded-lg border bg-background p-3 opacity-70 shadow-sm">
        <p className="text-xs font-semibold">Risk alert · Grid Master</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Daily loss limit at 80%</p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Gauge,
    title: "Remote controls, anywhere",
    description:
      "Start, pause, restart or emergency-stop any EA from your phone. Every command is queued, acknowledged and audited — no VPS login required.",
    visual: <ControlsVisual />,
    className: "md:col-span-4",
  },
  {
    icon: Bell,
    title: "Instant alerts",
    description:
      "Trade opens and closes, risk warnings, connection loss and daily reports — the moment they happen.",
    visual: <AlertsVisual />,
    className: "md:col-span-2",
  },
  {
    icon: Activity,
    title: "Real-time monitoring",
    description:
      "Balance, equity, open trades and floating P/L stream live to every device you own.",
    className: "md:col-span-2",
  },
  {
    icon: TrendingUp,
    title: "Deep analytics",
    description:
      "Win rate, drawdown, profit by symbol and hour — understand exactly how every strategy earns.",
    className: "md:col-span-2",
  },
  {
    icon: Lock,
    title: "Bank-grade security",
    description:
      "Encrypted channels, scoped API keys and a full audit trail. Your funds never leave your broker.",
    className: "md:col-span-2",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything your EAs need a cockpit for"
            description="Monitoring, control and protection in one place — designed so the critical action is never more than two taps away."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i * 0.06}
              className={cn("h-full", feature.className)}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-colors duration-300 hover:border-primary/40">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">
                  {feature.description}
                </p>
                {"visual" in feature ? feature.visual : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
