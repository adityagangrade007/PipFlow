"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "@/lib/api-client";
import type { BotCommand, BotConfig, CommandType } from "@/lib/types/trading";

const POLL_MS = 500;
const TIMEOUT_MS = 8_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CommandInput {
  type: CommandType;
  payload?: Partial<BotConfig>;
}

/**
 * Sends a remote command and resolves only when the EA has executed it
 * (PENDING → ACKNOWLEDGED → EXECUTED), mirroring the real command-queue flow.
 * Rejects on FAILED or timeout. `isPending` therefore covers the full
 * round-trip, which drives the button loading states.
 */
export function useBotCommand(botId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CommandInput): Promise<BotCommand> => {
      let command = await apiPost<BotCommand>(`/api/bots/${botId}/commands`, input);
      const deadline = Date.now() + TIMEOUT_MS;

      while (command.status === "PENDING" || command.status === "ACKNOWLEDGED") {
        if (Date.now() > deadline) {
          throw new Error("Command timed out waiting for the EA.");
        }
        await sleep(POLL_MS);
        const list = await apiGet<BotCommand[]>(`/api/bots/${botId}/commands`);
        command = list.find((c) => c.id === command.id) ?? command;
      }

      if (command.status === "FAILED") {
        throw new Error(command.error ?? "Command failed.");
      }
      return command;
    },
    onSettled: () => {
      // Bot status, floating P&L and trades may all have changed.
      void queryClient.invalidateQueries({ queryKey: ["bots"] });
      void queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      void queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
