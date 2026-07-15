import { ok, requireSession } from "@/server/api-helpers";
import { getPortfolio } from "@/server/services/mock-trading";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  return ok(getPortfolio());
}
