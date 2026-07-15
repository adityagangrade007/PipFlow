/** Where users land after signing in. */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/** Route prefixes that require an authenticated session. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/portfolio",
  "/bots",
  "/trades",
  "/analytics",
  "/notifications",
  "/profile",
  "/settings",
  "/admin",
] as const;

/** Auth pages — signed-in users are redirected away from these. */
export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/** Only allow same-origin relative callback URLs (prevents open redirects). */
export function safeCallbackUrl(url: string | null | undefined): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) return url;
  return DEFAULT_LOGIN_REDIRECT;
}
