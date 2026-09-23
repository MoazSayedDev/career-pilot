# CareerPilot — frontend

Next.js (App Router) client for the CareerPilot CV builder. Talks to the
NestJS backend under `../backend`.

## Requirements

- Node.js >= 20
- npm (CI installs with `npm ci` from the committed lockfile)

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `lib/axios.ts` | Base URL for API calls. `/api` (Mode A) or the backend origin (Mode B). **Public value** — Next.js inlines it into client JS; never put secrets in it. |
| `API_PROXY_TARGET` | Mode A | `next.config.ts` rewrites | Backend origin the Next server forwards `/api/*` to. Server-side only; never bundled into client code. |

**Mode A — same-origin API gateway (recommended):** set `NEXT_PUBLIC_API_URL=/api` and
`API_PROXY_TARGET=https://backend-host`. Cookies stay first-party and CORS is
eliminated — required whenever the refresh cookie is `SameSite=strict`.
**Mode B — direct cross-origin:** set only `NEXT_PUBLIC_API_URL`; the backend must
allowlist the frontend origin in `CORS_ORIGIN` and issue the refresh cookie with
`SameSite=None; Secure`, otherwise login succeeds but the session is never
persisted (silent auth failure).

`.env*` files are git-ignored; secrets stay out of the repository.

## Commands

```bash
npm ci          # install exactly from package-lock.json
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (core-web-vitals + typescript)
npx tsc --noEmit
```

## Production deployment

1. `npm ci --omit=dev` is NOT sufficient — the build needs devDependencies.
   Build in a build stage, then keep only the runtime output.
2. `npm run build` (fails on type/lint errors by design).
3. `npm run start` serves on port 3000 by default (`PORT` to override).
4. Put the app behind a TLS-terminating reverse proxy (nginx/Caddy) and
   add a Content-Security-Policy there (see `next.config.ts` — a static
   CSP is deliberately not set in-app).

## Architecture notes

- `app/**` — App Router routes; thin wrappers that render page components.
- `pages/**` — view components only (not routable; the Pages Router is not
  configured). `pages/_app.tsx` is intentionally absent so Next never
  prerenders stray routes from this folder.
- `components/**` — layout and UI primitives.
- `services/**` — typed API clients and zod schemas per domain.
- `lib/**` — axios instance with token refresh, i18n, theme, error mapping.
- `proxy.ts` — Next.js 16 route protection (cookie presence only; real
  authorization is enforced by backend JWT guards on every API call).
