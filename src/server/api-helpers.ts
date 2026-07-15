import { NextResponse } from "next/server";

import { auth } from "@/server/auth";

/** Standard success envelope: `{ data }`. */
export function ok<T>(data: T): NextResponse {
  return NextResponse.json({ data });
}

export function apiError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Returns the session or a ready-to-return 401 response. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      response: apiError(401, "UNAUTHORIZED", "Authentication required."),
    } as const;
  }
  return { session, response: null } as const;
}
