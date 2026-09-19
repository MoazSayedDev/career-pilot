import api from "@/lib/axios";
import { setAccessToken } from "@/lib/auth-token";
import type { CurrentUser } from "@/services/auth/types/auth.types";

/**
 * Google OAuth popup manager.
 *
 * Flow:
 *  1. Open a popup to the backend's `GET /auth/google` endpoint.
 *  2. Poll — never read — the popup window until it closes
 *     (the backend completed the OAuth round-trip and set the
 *     HttpOnly refresh cookie) or the timeout elapses.
 *  3. On close, call `POST /auth/refresh` to exchange the fresh
 *     refresh cookie for an access token, then `GET /auth/me`
 *     to load the signed-in user.
 *
 * Cross-origin popup content is never accessed; only `popup.closed`
 * is inspected, which is always readable.
 */

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;
const POLL_INTERVAL_MS = 1500;
const AUTH_TIMEOUT_MS = 120_000;

export type GoogleAuthError =
  | "popup_blocked"
  | "timeout"
  | "refresh_failed"
  | "cancelled";

export type GoogleAuthResult =
  | { success: true; user: CurrentUser }
  | { success: false; error: GoogleAuthError };

/**
 * Module-level singleton reference. Opening a second popup while
 * one is already open would leave orphaned windows and duplicate
 * OAuth sessions, so we reuse/focus the existing one instead.
 */
let popupRef: Window | null = null;

/** True while a Google auth popup is (or may be) open. */
export const isGoogleAuthInProgress = (): boolean =>
  typeof popupRef === "object" && popupRef !== null && !popupRef.closed;

/**
 * Opens the Google OAuth popup, centred on the user's screen.
 *
 * Returns `null` when the browser's popup blocker prevented the
 * window from opening (the call must happen inside a user-gesture
 * handler for browsers to allow it at all).
 */
export const openGoogleAuthPopup = (): Window | null => {
  // Re-focus an existing popup instead of opening a second one.
  if (popupRef && !popupRef.closed) {
    popupRef.focus();
    return popupRef;
  }

  const y = window.top?.outerHeight
    ? window.top.outerHeight / 2 + window.top.screenY - POPUP_HEIGHT / 2
    : window.screenY + window.screen.height / 2 - POPUP_HEIGHT / 2;
  const x = window.top?.outerWidth
    ? window.top.outerWidth / 2 + window.top.screenX - POPUP_WIDTH / 2
    : window.screenX + window.screen.width / 2 - POPUP_WIDTH / 2;

  popupRef = window.open(
    // The backend serves the OAuth entry point and owns the
    // redirect URI; NEXT_PUBLIC_API_URL already points at it.
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
    "google_oauth",
    `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${y},left=${x},` +
      "toolbar=no,menubar=no,location=no,status=no",
  );

  return popupRef;
};

/**
 * Waits for the popup to close, then verifies the login actually
 * succeeded by refreshing the access token and loading the user.
 *
 * Resolves with `{ success: false, error }` instead of throwing for
 * every expected outcome (blocked, timeout, cancelled, refresh
 * failure) so callers only branch on the result.
 */
export const pollGoogleAuth = async (
  popup: Window,
  options?: { timeoutMs?: number },
): Promise<GoogleAuthResult> => {
  const timeoutMs = options?.timeoutMs ?? AUTH_TIMEOUT_MS;

  try {
    const closed = await waitForPopupClose(popup, timeoutMs);

    if (!closed) {
      // Timed out — close the leftover popup so it cannot be reused.
      if (!popup.closed) popup.close();
      return { success: false, error: "timeout" };
    }
  } finally {
    // Fully detached: nothing outside this module may reuse the handle.
    popupRef = null;
  }

  /**
   * The refresh cookie was set by the backend inside the popup before
   * it closed. Exchange it for an access token — the popup being
   * closed without a cookie (user cancelled mid-consent) surfaces
   * here as a refresh failure.
   */
  let user: CurrentUser | null = null;

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
    user = meResponse.data?.data ?? null;
  } catch (error) {
    // A network drop mid-verification should not report "cancelled".
    void error;
    return { success: false, error: "refresh_failed" };
  }

  if (!user) {
    return { success: false, error: "refresh_failed" };
  }

  return { success: true, user };
};

/**
 * Resolves `true` when the popup closes, `false` on timeout.
 * Never reads popup contents.
 */
const waitForPopupClose = (
  popup: Window,
  timeoutMs: number,
): Promise<boolean> =>
  new Promise((resolve) => {
    if (popup.closed) {
      resolve(true);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(interval);
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(interval);
        resolve(false);
      }
    }, POLL_INTERVAL_MS);
  });

/**
 * Convenience wrapper used by the shared button component:
 * opens the popup and starts polling in one call.
 * `null` means the popup was blocked.
 */
export const startGoogleAuth = async (
  options?: { timeoutMs?: number },
): Promise<GoogleAuthResult | null> => {
  const popup = openGoogleAuthPopup();

  if (!popup) {
    return { success: false, error: "popup_blocked" };
  }

  return pollGoogleAuth(popup, options);
};

