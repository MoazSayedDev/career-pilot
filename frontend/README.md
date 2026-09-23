# CareerPilot — frontend

Next.js (App Router) client for the CareerPilot CV builder. Talks to the
NestJS backend under `../backend` **directly** (no Next.js API proxy).

## Requirements

- Node.js >= 20
- npm (CI installs with `npm ci` from the committed lockfile)

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `lib/axios.ts`, `lib/google-auth.ts` | Base URL of the backend API (e.g. `https://api.example.com`). **Public value** — Next.js inlines it into client JS; never put secrets in it. |

The frontend calls the backend **directly from the browser**. Because the
login refresh cookie is set by the backend origin, the backend must be
configured for the cross-site architecture (exact-origin CORS allowlist +
`COOKIE_CROSS_SITE=true` for a `SameSite=None; Secure` cookie) — see
`backend/.env.example`. Both frontend and backend must be served over
HTTPS in production for this to work.

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
2. `npm run build` (fails on type/lint errors by design). `NEXT_PUBLIC_API_URL`
   must be set at build time — it is inlined into the client bundle.
3. `npm run start` serves on port 3000 by default (`PORT` to override).
4. Serve over HTTPS behind a reverse proxy and add a Content-Security-Policy
   there (see `next.config.ts` — a static CSP is deliberately not set in-app).

## Architecture notes

- `app/**` — App Router routes; thin wrappers that render view components.
- `views/**` — view components only (not routable; the Pages Router is not
  configured).
- `components/**` — layout and UI primitives.
- `services/**` — typed API clients and zod schemas per domain.
- `lib/axios.ts` — API client with 401 refresh-token rotation; the refresh
  cookie is HttpOnly and never readable by JavaScript.
- `lib/google-auth.ts` — Google OAuth popup flow against the backend's
  `GET /auth/google`; the backend closes the popup when done.
- `proxy.ts` — Next.js 16 route protection (cookie presence only; real
  authorization is enforced by backend JWT guards on every API call).
