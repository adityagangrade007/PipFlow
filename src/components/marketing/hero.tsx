"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const trustItems = [
  { icon: ShieldCheck, label: "Encrypted command channel" },
  { icon: Zap, label: "2-minute setup" },
  { icon: Smartphone, label: "Built for mobile" },
] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* Backdrop: faint grid fading out radially + primary glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_10%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="absolute top-[-12rem] left-1/2 -z-10 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <Container className="flex flex-col items-center text-center">
        <motion.div {...fadeUp(0)}>
          <Badge
            variant="outline"
            className="gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Built for MetaTrader 4 &amp; 5
          </Badge>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Mission control for your{" "}
          <span className="bg-gradient-to-r from-primary to-[oklch(0.65_0.2_320)] bg-clip-text text-transparent">
            trading bots
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          className="mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
        >
          {siteConfig.description}
        </motion.p>

        <motion.div
          {...fadeUp(0.24)}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={siteConfig.links.getStarted}>
              Start monitoring free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/#features">Explore features</Link>
          </Button>
        </motion.div>

        <motion.ul
          {...fadeUp(0.32)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {trustItems.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <item.icon className="size-4 text-primary" aria-hidden />
              {item.label}
            </li>
          ))}
        </motion.ul>

        <motion.div {...fadeUp(0.4)} className="mt-14 w-full max-w-4xl sm:mt-20">
          <DashboardPreview />
        </motion.div>
      </Container>
    </section>
  );
}
