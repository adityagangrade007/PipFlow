import { z } from "zod";

import { COMMAND_TYPES } from "@/lib/types/trading";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
/** "07:00–20:00" (en dash), end may be 24:00. */
const HOURS_RE = /^([01]\d|2[0-3]):[0-5]\d–(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

/** Server-side payload for UPDATE_CONFIG commands (partial merge). */
export const botConfigUpdateSchema = z
  .object({
    riskPercent: z.number().min(0.1).max(10),
    lots: z.number().min(0.01).max(10),
    takeProfitPips: z.number().int().min(5).max(1000),
    stopLossPips: z.number().int().min(5).max(500),
    dailyLossLimit: z.number().int().min(50).max(10000),
    maxOpenTrades: z.number().int().min(1).max(10),
    tradingHours: z.string().regex(HOURS_RE, "Use HH:MM–HH:MM"),
  })
  .partial();

export const commandBodySchema = z
  .object({
    type: z.enum(COMMAND_TYPES),
    payload: botConfigUpdateSchema.optional(),
  })
  .refine((body) => body.type !== "UPDATE_CONFIG" || !!body.payload, {
    message: "UPDATE_CONFIG requires a payload.",
    path: ["payload"],
  });

/** Client-side risk settings form (trading hours split into two time fields). */
/** Number field that accepts what an `<input type="number">` produces. */
function numeric(min: number, max: number, opts?: { int?: boolean }) {
  let target = z.number("Enter a number").min(min, `Min ${min}`).max(max, `Max ${max}`);
  if (opts?.int) target = target.int("Whole numbers only");
  return z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .pipe(target);
}

export const botConfigFormSchema = z.object({
  riskPercent: numeric(0.1, 10),
  lots: numeric(0.01, 10),
  takeProfitPips: numeric(5, 1000, { int: true }),
  stopLossPips: numeric(5, 500, { int: true }),
  dailyLossLimit: numeric(50, 10000, { int: true }),
  maxOpenTrades: numeric(1, 10, { int: true }),
  tradingHoursStart: z.string().regex(TIME_RE, "HH:MM"),
  tradingHoursEnd: z.string().refine((v) => TIME_RE.test(v) || v === "24:00", "HH:MM"),
});

/** Raw form values (number inputs may hold strings while editing). */
export type BotConfigFormInput = z.input<typeof botConfigFormSchema>;
/** Parsed values handed to submit. */
export type BotConfigFormOutput = z.output<typeof botConfigFormSchema>;
