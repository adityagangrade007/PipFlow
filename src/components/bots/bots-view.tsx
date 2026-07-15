"use client";

import { BotCard } from "@/components/bots/bot-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useBots } from "@/hooks/use-trading";

export function BotsView() {
  const { data: bots, isPending, isError, error } = useBots();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load bots: {error.message}. Retrying automatically.
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  const running = bots.filter((b) => b.status === "RUNNING").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Bots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {running} of {bots.length} running — commands are queued, acknowledged and
          executed by the EA.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>
    </div>
  );
}
