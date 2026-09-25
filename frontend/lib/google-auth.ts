import api from "@/lib/axios";
import { setAccessToken } from "@/lib/auth-token";
import type { CurrentUser } from "@/services/auth/types/auth.types";

/**
 * Google OAuth flow manager — full-page navigation variant.
 *
 * Why NOT a popup: the OAuth callback URL is owned by the backend
 * (Passport's `callbackURL`). Unless it points back at THIS origin,
 * Google returns the user to a different app and nothing here — popup
 * `postMessage`, `window.close`, anything — can observe it. A popup also
 * cannot be salvaged from the frontend alone when the callback lands
 * elsewhere.
 *
 * Flow (every step stays on this origin thanks to the `/api/*` proxy):
 *  1. `beginGoogleAuth` marks sessionStorage and navigates the whole tab
 *     to `/api/auth/google`, which the backend redirects to Google.
 *  2. After consent, Google returns the user to
 *     `/api/auth/google/callback` (this origin). The proxy exchanges the
 *     code via the backend — which sets the refresh cookie HERE — and
 *     answers with a completion page that redirects the tab to
 *     `/login?logged_in=1` (or `=0` on failure).
 *  3. `continueGoogleAuthOutcome` runs on the login page: it reads the
 *     flag, verifies the session (`/auth/refresh` + `/auth/me`), and the
 *     page sends the user to the dashboard. The server-side route
 *     protection (`proxy.ts`) also bounces `/login?logged_in=1` straight
 *     to `/dashboard` when the cookie is already present.
 */

/** Session flag marking an OAuth round-trip started by this tab. */
const GOOGLE_AUTH_STATE_KEY = "career-pilot:google-auth-pending";

/** Query flag the callback completion page appends to the login URL. */
const OAUTH_OUTCOME_PARAM = "logged_in";

export type GoogleAuthError =
  | "popup_blocked"
  | "timeout"
  | "refresh_failed"
  | "cancelled";

export type GoogleAuthResult =
  | { success: true; user: CurrentUser }
  | { success: false; error: GoogleAuthError };

/**
 * Navigates the current tab to the Google OAuth entry point.
 *
 * A full-page navigation cannot be blocked like a popup, so there is no
 * failure mode to report from here.
 */
export const beginGoogleAuth = (): void => {
  try {
    sessionStorage.setItem(GOOGLE_AUTH_STATE_KEY, "1");
  } catch {
    // Private-browsing storage quotas: the flag is a UX nicety only.
  }
  // A Route Handler (API) destination cannot be navigated to with
  // next/navigation's router — a full-page load is required here.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/api/auth/google");
};

/**
 * Reads (and consumes) the outcome flag the callback completion page
 * appended to the URL. `null` when this page load is not the return leg
 * of an OAuth round-trip. The flag is stripped from the URL afterwards so
 * a manual refresh of the page cannot re-trigger the login round-trip.
 */
export const getGoogleAuthOutcome = (): GoogleAuthResult | null => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has(OAUTH_OUTCOME_PARAM)) return null;

  try {
    sessionStorage.removeItem(GOOGLE_AUTH_STATE_KEY);
  } catch {
    // Nothing to clean up.
  }

  const success = params.get(OAUTH_OUTCOME_PARAM) === "1";

  // Consume the flag in the address bar (keeps the redirect param).
  const url = new URL(window.location.href);
  url.searchParams.delete(OAUTH_OUTCOME_PARAM);
  window.history.replaceState(null, "", url.toString());

  if (success) {
    // Session existence is verified by the refresh round-trip before
    // this result is trusted (see `continueGoogleAuthOutcome`).
    return { success: true, user: null as unknown as CurrentUser };
  }

  return { success: false, error: "refresh_failed" };
};

/**
 * Continues an OAuth return on the login page: verifies the session for
 * real (`/auth/refresh` + `/auth/me` are authoritative — the URL flag is
 * not) and resolves the final result for the page to act on.
 *
 * The verification runs AT MOST ONCE per page load: callers (SignInPage,
 * SignUpPage) may each invoke this — and React StrictMode mounts effects
 * twice in development — but a memoised promise guarantees a single
 * `/auth/refresh`. That matters because the backend rotates the refresh
 * cookie on every refresh: a concurrent second call would race the
 * rotation and fail spuriously.
 *
 * Resolves `null` for ordinary page loads (no OAuth return in progress).
 */
let outcomePromise: Promise<GoogleAuthResult | null> | null = null;

export const continueGoogleAuthOutcome = (): Promise<GoogleAuthResult | null> => {
  if (!outcomePromise) {
    outcomePromise = runContinueGoogleAuthOutcome().catch(() =>
      ({ success: false, error: "refresh_failed" }) as GoogleAuthResult,
    );
  }
  return outcomePromise;
};

const runContinueGoogleAuthOutcome = async (): Promise<GoogleAuthResult | null> => {
  const outcome = getGoogleAuthOutcome();
  if (!outcome) return null;

  if (!outcome.success) {
    // Consent denied / upstream failure — the login page shows the error.
    return outcome;
  }

  try {
    const refreshResponse = await api.post<{ data: { accessToken: string } }>(
      "/auth/refresh",
    );
    const accessToken = refreshResponse.data?.data?.accessToken;

    if (!accessToken) {
      return { success: false, error: "refresh_failed" };
    }

    setAccessToken(accessToken);

    const meResponse = await api.get<{ data: CurrentUser }>("/auth/me");
    const user = meResponse.data?.data ?? null;

    if (!user) {
      return { success: false, error: "refresh_failed" };
    }

    return { success: true, user };
  } catch {
    // A network drop mid-verification surfaces as a normal login failure.
    return { success: false, error: "refresh_failed" };
  }
};
