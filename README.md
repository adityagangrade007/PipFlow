# Pipflow

**Mission control for your MetaTrader bots.** A premium, mobile-first SaaS web application for remotely monitoring and controlling MetaTrader Expert Advisors (MT4/MT5).

> ⚠️ **Prototype.** There is no real MT4/MT5 integration. Trading data is (and will be) produced by a realistic simulation layer designed to be swapped for a live MetaTrader bridge with zero frontend changes.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| Language | TypeScript (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) (new-york style, neutral base) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [lucide-react](https://lucide.dev) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) — dark / light / system |
| Fonts | Geist Sans & Geist Mono via `next/font` |
| Quality | ESLint (flat config) + Prettier + `prettier-plugin-tailwindcss` |

## Quick demo (no database needed)

```bash
npm install
npm run build && npm run start
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the built-in demo account: **demo@pipflow.app / demo1234** (the login page has a "Fill in" button). You get the live dashboard, the trading API and full Remote EA Control — pause/resume/restart/emergency-stop bots and edit their risk settings. All trading data is simulated; open-trade P&L ticks every 5 seconds.

> The demo account and the in-memory command queue are prototype conveniences. Registration/password reset need PostgreSQL (below); commands reset on server restart.

## Getting started

Requires Node.js ≥ 20 (see `.nvmrc`) and a PostgreSQL database ([Neon](https://neon.tech) free tier works).

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET
npx prisma migrate deploy   # apply committed migrations
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Authentication

Email/password auth built on **Auth.js v5** (JWT sessions, 30-day expiry) with a **Prisma** adapter:

- `/register`, `/login`, `/forgot-password`, `/reset-password` — React Hook Form + Zod, validated on both client and server.
- Middleware protects all app routes (`/dashboard`, `/bots`, …) and redirects signed-in users away from auth pages. An edge-safe auth config (`src/server/auth.config.ts`) keeps Prisma/bcrypt out of the middleware bundle.
- Password reset issues a hashed, single-use token valid for 1 hour. **No email provider is wired up in the prototype** — the reset link is printed to the server console (`src/server/services/email.ts` is the swap point for Resend/SES).
- Passwords are hashed with bcrypt (12 rounds). Reset responses never reveal whether an account exists.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (CI-friendly) |

## Project structure

```
src/
├── app/
│   ├── (marketing)/        # Public marketing pages (landing)
│   ├── globals.css         # Design tokens (light + dark) & Tailwind setup
│   └── layout.tsx          # Root layout: fonts, metadata, ThemeProvider
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Header, mobile nav drawer, footer
│   ├── marketing/          # Landing page sections
│   └── shared/             # Reusable pieces (Container, Logo, Reveal, …)
├── hooks/                  # Reusable React hooks
├── lib/                    # Config, utilities, validators
├── providers/              # Client context providers
└── server/                 # Server-side layer (bridge, services — future phases)
```

## Design system

- **Tokens, not hard-coded colors** — all colors are OKLCH CSS variables in `globals.css`, themed for light and dark. Semantic `profit` / `loss` tokens are reserved for P&L values, which always also carry a `+`/`−` sign (never color-alone).
- **Motion with restraint** — 150–300 ms reveals with a shared easing curve; `prefers-reduced-motion` disables animation globally.
- **Mobile-first** — bottom-sheet navigation drawer, ≥ 44 px touch targets, fluid type.

## Deploying to Vercel

1. Push the repository to GitHub and [import it into Vercel](https://vercel.com/new) — the Next.js preset is detected automatically.
2. Set environment variables: `DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon direct), `AUTH_SECRET` (`openssl rand -base64 32`).
3. Deploy. The `vercel-build` script runs `prisma generate && prisma migrate deploy && next build`, so the schema is applied automatically.

Node version is pinned via `.nvmrc`; `main` should always build cleanly (`npm run build`).

## Roadmap

- [x] **Phase 1** — Foundation: design system, theming, landing page
- [x] **Phase 2** — Authentication: Auth.js v5, Prisma + PostgreSQL, register/login/reset, protected routes
- [x] **Phase 3** — App shell & dashboard: responsive sidebar/tab bar, KPI cards, equity & P&L charts, trade distribution, recent trades/notifications (mock data)
- [ ] **Phase 4** — Simulation engine & trading bridge interface (replaces `src/lib/mock/`)
- [ ] **Phase 5** — Bots & remote controls (command queue)
- [ ] **Phase 6** — Trades, portfolio, analytics
- [ ] **Phase 7** — Notifications, profile, settings
- [ ] **Phase 8** — Admin panel & polish

## License

Private prototype — not licensed for redistribution.
# PipFlow
