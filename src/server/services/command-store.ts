import type {
  BotCommand,
  BotConfig,
  BotStatus,
  CommandStatus,
  CommandType,
} from "@/lib/types/trading";

/**
 * In-memory command queue for Remote EA Control.
 *
 * Commands are stored with pre-computed acknowledge/execute latencies; their
 * status is derived from elapsed time on every read, which gives a realistic
 * PENDING → ACKNOWLEDGED → EXECUTED lifecycle without background timers
 * (serverless-safe within an instance). Executed commands are the source of
 * truth for each bot's effective status and risk configuration.
 *
 * Prototype note: state is per-process — it resets on redeploy/cold start.
 * The production replacement is the DB-backed `Command` table from the
 * blueprint; the API contract stays identical.
 */

interface StoredCommand {
  id: string;
  seq: number;
  botId: string;
  type: CommandType;
  payload: Partial<BotConfig> | null;
  createdAt: number;
  ackMs: number;
  execMs: number;
  fails: boolean;
}

let commands: StoredCommand[] = [];
let seq = 0;
let version = 0;

const FAILURE_MESSAGE =
  "EA did not acknowledge the command within the timeout. Please try again.";

/** Status a state-changing command leaves the bot in once executed. */
const RESULT_STATUS: Partial<Record<CommandType, BotStatus>> = {
  START: "RUNNING",
  RESUME: "RUNNING",
  RESTART: "RUNNING",
  PAUSE: "PAUSED",
  EMERGENCY_STOP: "STOPPED",
};

function hash01(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function statusAt(cmd: StoredCommand, now: number): CommandStatus {
  const elapsed = now - cmd.createdAt;
  if (elapsed >= cmd.execMs) return cmd.fails ? "FAILED" : "EXECUTED";
  if (elapsed >= cmd.ackMs) return "ACKNOWLEDGED";
  return "PENDING";
}

function toPublic(cmd: StoredCommand, now: number): BotCommand {
  const status = statusAt(cmd, now);
  return {
    id: cmd.id,
    botId: cmd.botId,
    type: cmd.type,
    payload: cmd.payload,
    status,
    error: status === "FAILED" ? FAILURE_MESSAGE : null,
    createdAt: new Date(cmd.createdAt).toISOString(),
    executedAt:
      status === "EXECUTED" || status === "FAILED"
        ? new Date(cmd.createdAt + cmd.execMs).toISOString()
        : null,
  };
}

export function createCommand(
  botId: string,
  type: CommandType,
  payload: Partial<BotConfig> | null = null
): BotCommand {
  seq++;
  version++;
  const now = Date.now();
  const h = hash01(seq * 7919 + 13);
  // Occasional realistic failures — never for emergency stop or config saves.
  const canFail =
    type === "START" || type === "PAUSE" || type === "RESUME" || type === "RESTART";
  const cmd: StoredCommand = {
    id: `cmd-${seq}-${now.toString(36)}`,
    seq,
    botId,
    type,
    payload,
    createdAt: now,
    ackMs: Math.round(150 + h * 300),
    execMs: Math.round(600 + hash01(seq * 31 + 7) * 900),
    fails: canFail && h < 0.06,
  };
  commands.push(cmd);
  return toPublic(cmd, now);
}

export function listCommands(botId: string, now = Date.now(), limit = 20): BotCommand[] {
  return commands
    .filter((c) => c.botId === botId)
    .slice(-limit)
    .reverse()
    .map((c) => toPublic(c, now));
}

/** Latest executed state-changing command for a bot, if any. */
export function getEffectiveState(
  botId: string,
  now = Date.now()
): { status: BotStatus; at: number } | null {
  for (let i = commands.length - 1; i >= 0; i--) {
    const cmd = commands[i];
    if (cmd.botId !== botId || cmd.fails) continue;
    const result = RESULT_STATUS[cmd.type];
    if (!result) continue;
    const execAt = cmd.createdAt + cmd.execMs;
    if (execAt <= now) return { status: result, at: execAt };
  }
  return null;
}

/** Execution timestamps of all executed emergency stops (force-close cutoffs). */
export function getEmergencyStops(botId: string, now = Date.now()): number[] {
  return commands
    .filter(
      (c) =>
        c.botId === botId &&
        c.type === "EMERGENCY_STOP" &&
        !c.fails &&
        c.createdAt + c.execMs <= now
    )
    .map((c) => c.createdAt + c.execMs);
}

/** Merged config overrides from all executed UPDATE_CONFIG commands. */
export function getConfigOverride(botId: string, now = Date.now()): Partial<BotConfig> {
  let merged: Partial<BotConfig> = {};
  for (const cmd of commands) {
    if (
      cmd.botId === botId &&
      cmd.type === "UPDATE_CONFIG" &&
      cmd.payload &&
      !cmd.fails &&
      cmd.createdAt + cmd.execMs <= now
    ) {
      merged = { ...merged, ...cmd.payload };
    }
  }
  return merged;
}

/** Bumped on every new command — used to invalidate the timeline cache. */
export function getCommandsVersion(): number {
  return version;
}

/** Test/dev helper. */
export function resetCommands(): void {
  commands = [];
  version++;
}
