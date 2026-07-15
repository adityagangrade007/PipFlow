import type { NextRequest } from "next/server";

import { tradesQuerySchema } from "@/lib/validators/trades";
import { apiError, ok, requireSession } from "@/server/api-helpers";
import { getTrades } from "@/server/services/mock-trading";

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = tradesQuerySchema.safeParse(params);
  if (!parsed.success) {
    return apiError(400, "BAD_REQUEST", "Invalid query parameters.");
  }

  return ok(getTrades(parsed.data));
}
