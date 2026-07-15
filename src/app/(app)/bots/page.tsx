import type { Metadata } from "next";

import { BotsView } from "@/components/bots/bots-view";

export const metadata: Metadata = {
  title: "Bots",
};

export default function BotsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <BotsView />
    </div>
  );
}
