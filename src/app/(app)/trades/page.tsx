import type { Metadata } from "next";

import { TradesView } from "@/components/trades/trades-view";

export const metadata: Metadata = {
  title: "Trades",
};

export default function TradesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <TradesView />
    </div>
  );
}
