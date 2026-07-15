import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="cta" className="scroll-mt-24 pb-20 sm:pb-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.42_0.2_290)] px-6 py-16 text-center sm:px-16 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white_0%,transparent_60%)] opacity-10"
            />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Take command of your trading — from anywhere
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-pretty text-white/80">
              Connect your first bot in minutes. Free to start, no credit card required.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="relative mt-8 bg-white text-neutral-900 hover:bg-white/90"
            >
              <Link href="/register">
                Start monitoring free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
