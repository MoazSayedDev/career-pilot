"use client";

import { useCallback } from "react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { beginGoogleAuth } from "@/lib/google-auth";
import type { CurrentUser } from "@/services/auth/types/auth.types";
import type { GoogleAuthError } from "@/lib/google-auth";
import { cn } from "@/utils";

interface GoogleAuthButtonProps {
  /** Controls the label: sign-in vs sign-up copy. */
  mode: "signin" | "signup";
  /** Kept for call-site compatibility; the flow completes on the login page. */
  onSuccess: (user: CurrentUser) => void;
  /** Kept for call-site compatibility; failures surface on the login page. */
  onError: (error: GoogleAuthError) => void;
  disabled?: boolean;
}

/** Official Google "G" mark. */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.19a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.17-2 3.45-4.95 3.45-8.55Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.1 0 5.7-1.03 7.61-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.89 1.1-3 0-5.54-2.02-6.44-4.75H1.73v2.98A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.56 14.67a7.2 7.2 0 0 1 0-4.6V7.09H1.73a12 12 0 0 0 0 10.82l3.83-2.98Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.7 1.19 15.1 0 12 0A12 12 0 0 0 1.73 6.09l3.83 2.98C6.46 6.77 9 4.75 12 4.75Z"
    />
  </svg>
);

/**
 * Shared Google OAuth button used by the sign-in and sign-up pages.
 *
 * Deliberately NOT a popup: the OAuth callback URL is owned by the
 * backend (Passport `callbackURL`), so when it points at a different
 * origin no popup code can ever observe the return. The button therefore
 * navigates the whole tab to the same-origin `/api/auth/google` entry
 * point; the callback completion page brings the tab back to
 * `/login?logged_in=…`, where `SignInPage`/`SignUpPage` verify the
 * session and finish the flow (`continueGoogleAuthOutcome`).
 */
export function GoogleAuthButton({
  mode,
  disabled = false,
}: GoogleAuthButtonProps) {
  const { t } = useI18n();

  const handleClick = useCallback(() => {
    beginGoogleAuth();
  }, []);

  const label = t(
    mode === "signin" ? "auth.signIn.google" : "auth.signUp.google",
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5",
        "text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50",
        "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );
}
