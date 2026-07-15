import { z } from "zod";

import { SYMBOLS } from "@/lib/types/trading";

export const tradesQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  q: z.string().trim().max(40).optional(),
  symbol: z.enum(SYMBOLS).optional(),
  botId: z.string().max(40).optional(),
  direction: z.enum(["BUY", "SELL"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export type TradesQuery = z.infer<typeof tradesQuerySchema>;
