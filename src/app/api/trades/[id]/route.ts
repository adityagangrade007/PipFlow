import { apiError, ok, requireSession } from "@/server/api-helpers";
import { getTradeById } from "@/server/services/mock-trading";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireSession();
  if (response) return response;

  const { id } = await params;
  const trade = getTradeById(id);
  if (!trade) return apiError(404, "NOT_FOUND", "Trade not found.");

  return ok(trade);
}
