import { Check } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For trying the platform with a single strategy.",
    features: [
      "1 connected bot",
      "Live dashboard",
      "Trade open & close alerts",
      "7-day trade history",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious traders running multiple strategies.",
    features: [
      "Up to 10 bots",
      "Full remote controls",
      "Risk guardrails & daily loss limits",
      "Advanced analytics & reports",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Desk",
    price: "$99",
    period: "per month",
    description: "For prop desks and teams managing fleets of EAs.",
    features: [
      "Unlimited bots",
      "Team seats & roles",
      "API access",
      "Custom alert routing",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing that scales with your desk"
            description="Start free, upgrade when your strategies do. No lock-in — cancel anytime."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  tier.highlighted && "shadow-lg ring-2 ring-primary"
                )}
              >
                {tier.highlighted ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3">
                    Most popular
                  </Badge>
                ) : null}

                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </p>

                <ul className="mt-7 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={tier.highlighted ? "default" : "outline"}
                  className="mt-8 w-full"
                >
                  <Link href="/register">{tier.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
