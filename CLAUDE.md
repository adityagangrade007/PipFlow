# Pipflow — project notes for Claude

Prototype SaaS for remotely monitoring/controlling MetaTrader EAs. **No real MT4/MT5** — a deterministic mock trading service stands in behind the same API contract a future bridge will implement.

## Key architecture
- `src/server/services/mock-trading.ts` — stateless simulated timeline (seeded, ~1,250 trades from a fixed genesis to "now"); open-trade P&L re-samples every 5s → live updates via polling.
- `src/server/services/command-store.ts` — in-memory EA command queue (PENDING→ACKNOWLEDGED→EXECUTED derived from elapsed time, ~6% simulated failures). Executed commands are the source of truth for bot status/config; emergency stops force-close open trades in the timeline. Resets on server restart (per-instance on Vercel) — production replacement is the DB-backed Command table.
- APIs (all session-guarded, `{data}|{error}` envelope): `/api/trades` (search/filter/pagination), `/api/trades/[id]`, `/api/bots`, `/api/bots/[botId]/commands` (POST/GET, 409 transition guards), `/api/portfolio`.
- Auth: Auth.js v5 JWT (`trustHost: true`), edge-safe split config (`auth.config.ts` for middleware). **Demo account, no DB needed: demo@pipflow.app / demo1234** (hardcoded in `auth.ts`). Register/password-reset need Postgres (`DATABASE_URL` + `DIRECT_URL`); `vercel-build` skips migrations when `DIRECT_URL` unset.
- Client data: TanStack Query polling hooks (`src/hooks/use-trading.ts`, `use-bot-command.ts`).

## Constraints
- Pin **Next 15** (`create-next-app@latest` gives 16) and **Prisma 6** (7 needs driver adapters).
- Zod v4 + RHF: use `z.input`/`z.output` generics on `useForm`; `z.coerce` breaks resolver types.
- Testing without DB: log in as demo via `/api/auth/csrf` + credentials callback with a cookie jar.
- `pkill -f "next-serve[r]"` (bracket trick) — plain pattern kills the invoking shell.

## Status
ALL PAGES DONE and e2e-verified (2026-07-16): landing, auth, dashboard, trades (tabs/search/filters/pagination), portfolio, bots (full EA control), analytics, notifications, settings, profile, admin (role-gated; second demo account **admin@pipflow.app / admin1234**). PWA manifest + robots + sitemap + skip-link + loading/error boundaries shipped. Build: 24 routes, lint clean.
Still prototype-level by design: real DB provisioning (register/reset need it), durable command store, `/trades/[id]` detail page (API exists, no UI), email provider.
