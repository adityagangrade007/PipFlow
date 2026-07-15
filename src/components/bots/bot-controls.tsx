"use client";

import { Loader2, OctagonX, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ConfirmCommandDialog } from "@/components/bots/confirm-command-dialog";
import { Button } from "@/components/ui/button";
import type { useBotCommand } from "@/hooks/use-bot-command";
import type { Bot, CommandType } from "@/lib/types/trading";

type StateCommand = Exclude<CommandType, "UPDATE_CONFIG">;
type CommandMutation = ReturnType<typeof useBotCommand>;

interface CommandMeta {
  label: string;
  pendingLabel: string;
  icon: typeof Play;
  dialogTitle: (bot: Bot) => string;
  dialogDescription: (bot: Bot) => string;
  successToast: (bot: Bot) => string;
  destructive?: boolean;
  typedConfirmation?: string;
}

export const COMMAND_META: Record<StateCommand, CommandMeta> = {
  START: {
    label: "Start",
    pendingLabel: "Starting…",
    icon: Play,
    dialogTitle: (bot) => `Start ${bot.name}?`,
    dialogDescription: (bot) =>
      `${bot.name} will begin trading ${bot.symbol} with its configured risk settings (${bot.config.riskPercent}% risk, ${bot.config.lots.toFixed(2)} lots).`,
    successToast: (bot) => `${bot.name} started`,
  },
  PAUSE: {
    label: "Pause",
    pendingLabel: "Pausing…",
    icon: Pause,
    dialogTitle: (bot) => `Pause ${bot.name}?`,
    dialogDescription: () =>
      "The EA will stop opening new trades. Existing open positions remain managed (stop loss and take profit stay active).",
    successToast: (bot) => `${bot.name} paused`,
  },
  RESUME: {
    label: "Resume",
    pendingLabel: "Resuming…",
    icon: Play,
    dialogTitle: (bot) => `Resume ${bot.name}?`,
    dialogDescription: () =>
      "The EA will resume opening trades under its current risk settings.",
    successToast: (bot) => `${bot.name} resumed`,
  },
  RESTART: {
    label: "Restart",
    pendingLabel: "Restarting…",
    icon: RotateCcw,
    dialogTitle: (bot) => `Restart ${bot.name}?`,
    dialogDescription: () =>
      "The EA process restarts and reloads its configuration. Open positions are kept; uptime resets.",
    successToast: (bot) => `${bot.name} restarted`,
  },
  EMERGENCY_STOP: {
    label: "Emergency stop",
    pendingLabel: "Stopping…",
    icon: OctagonX,
    dialogTitle: (bot) => `Emergency stop ${bot.name}?`,
    dialogDescription: (bot) =>
      `This immediately halts the EA and closes ${bot.openTrades > 0 ? `all ${bot.openTrades} open position${bot.openTrades === 1 ? "" : "s"}` : "any open positions"} at market price. Use only when something is wrong.`,
    successToast: (bot) =>
      `Emergency stop executed — ${bot.name} halted, positions closed`,
    destructive: true,
    typedConfirmation: "STOP",
  },
};

/** Which commands are offered in each bot state. */
const COMMANDS_FOR_STATUS: Record<Bot["status"], StateCommand[]> = {
  RUNNING: ["PAUSE", "RESTART", "EMERGENCY_STOP"],
  PAUSED: ["RESUME", "RESTART", "EMERGENCY_STOP"],
  STOPPED: ["START"],
};

/** Label for the card's status badge while a state command is in flight. */
export function pendingCommandLabel(mutation: CommandMutation): string | null {
  if (!mutation.isPending || !mutation.variables) return null;
  const type = mutation.variables.type;
  if (type === "UPDATE_CONFIG") return null;
  return COMMAND_META[type].pendingLabel;
}

export function BotControls({ bot, mutation }: { bot: Bot; mutation: CommandMutation }) {
  const pendingType =
    mutation.isPending && mutation.variables?.type !== "UPDATE_CONFIG"
      ? mutation.variables?.type
      : undefined;

  function send(type: StateCommand) {
    mutation.mutate(
      { type },
      {
        onSuccess: () => toast.success(COMMAND_META[type].successToast(bot)),
        onError: (error) =>
          toast.error(`${COMMAND_META[type].label} failed`, {
            description: error.message,
          }),
      }
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {COMMANDS_FOR_STATUS[bot.status].map((type) => {
        const meta = COMMAND_META[type];
        const isThisPending = pendingType === type;
        const button = (
          <Button
            size="sm"
            variant={
              meta.destructive ? "destructive" : type === "START" ? "default" : "outline"
            }
            disabled={mutation.isPending}
            className="min-w-24"
          >
            {isThisPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <meta.icon className="size-3.5" aria-hidden />
            )}
            {isThisPending ? meta.pendingLabel : meta.label}
          </Button>
        );

        return (
          <ConfirmCommandDialog
            key={type}
            trigger={button}
            title={meta.dialogTitle(bot)}
            description={meta.dialogDescription(bot)}
            confirmLabel={meta.label}
            destructive={meta.destructive}
            typedConfirmation={meta.typedConfirmation}
            onConfirm={() => send(type)}
          />
        );
      })}
    </div>
  );
}
