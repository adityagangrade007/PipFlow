import type { Metadata } from "next";

import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <PortfolioView />
    </div>
  );
}
