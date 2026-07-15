import type { NextRequest } from "next/server";

import type { BotStatus, CommandType } from "@/lib/types/trading";
import { commandBodySchema } from "@/lib/validators/commands";
import { apiError, ok, requireSession } from "@/server/api-helpers";
import { createCommand, listCommands } from "@/server/services/command-store";
import { getBotStatus } from "@/server/services/mock-trading";

/** Which statuses a command may be issued from. */
const ALLOWED_FROM: Record<CommandType, BotStatus[] | "ANY"> = {
  START: ["STOPPED"],
  PAUSE: ["RUNNING"],
  RESUME: ["PAUSED"],
  RESTART: ["RUNNING", "PAUSED"],
  EMERGENCY_STOP: ["RUNNING", "PAUSED"],
  UPDATE_CONFIG: "ANY",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { response } = await requireSession();
  if (response) return response;

  const { botId } = await params;
  const status = getBotStatus(botId);
  if (!status) return apiError(404, "NOT_FOUND", "Bot not found.");

  const body = await request.json().catch(() => null);
  const parsed = commandBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "BAD_REQUEST", "Invalid command payload.");
  }

  const allowed = ALLOWED_FROM[parsed.data.type];
  if (allowed !== "ANY" && !allowed.includes(status)) {
    return apiError(
      409,
      "INVALID_STATE",
      `Cannot ${parsed.data.type.toLowerCase().replace("_", " ")} while the bot is ${status.toLowerCase()}.`
    );
  }

  const command = createCommand(botId, parsed.data.type, parsed.data.payload ?? null);
  return ok(command);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { response } = await requireSession();
  if (response) return response;

  const { botId } = await params;
  if (!getBotStatus(botId)) return apiError(404, "NOT_FOUND", "Bot not found.");

  return ok(listCommands(botId));
}
