import { Cta } from "@/components/marketing/cta";
import { Faq } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { Pricing } from "@/components/marketing/pricing";
import { Stats } from "@/components/marketing/stats";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <Features />
      <Stats />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
