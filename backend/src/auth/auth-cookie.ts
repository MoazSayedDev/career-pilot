import type { CookieOptions } from 'express';

/**
 * Refresh-cookie options shared by every auth endpoint that sets or
 * clears the `refreshToken` cookie.
 *
 * Same-site deployment (default): the cookie stays `SameSite=strict`,
 * the strongest option — it is simply never sent on cross-site requests.
 *
 * Cross-site deployment (frontend and backend on different origins):
 * browsers reject strict cookies entirely, which silently breaks login
 * persistence. Set `COOKIE_CROSS_SITE=true` to emit `SameSite=None`,
 * which is only honoured when the cookie is also `Secure` — so the app
 * must be served over HTTPS in production. The token itself remains
 * `HttpOnly` (never readable by JavaScript) in both modes.
 */
export function refreshTokenCookieOptions(): CookieOptions {
  const crossSite = process.env.COOKIE_CROSS_SITE === 'true';

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || crossSite,
    sameSite: crossSite ? 'none' : 'strict',
  };
}
