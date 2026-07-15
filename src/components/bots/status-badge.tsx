"use client";

import { Loader2 } from "lucide-react";

import type { BotStatus } from "@/lib/types/trading";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BotStatus, { label: string; dot: string; text: string }> = {
  RUNNING: { label: "Running", dot: "bg-profit animate-pulse", text: "text-profit" },
  PAUSED: {
    label: "Paused",
    dot: "bg-[var(--color-chart-4)]",
    text: "text-muted-foreground",
  },
  STOPPED: { label: "Stopped", dot: "bg-loss", text: "text-loss" },
};

export function BotStatusBadge({
  status,
  pendingLabel,
}: {
  status: BotStatus;
  /** Overrides the badge while a command is in flight, e.g. "Pausing…". */
  pendingLabel?: string | null;
}) {
  if (pendingLabel) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        {pendingLabel}
      </span>
    );
  }

  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        style.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </span>
  );
}
