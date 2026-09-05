import axios from "axios";

/**
 * Maps an API error to a safe, user-facing message.
 *
 * Never exposes response bodies, URLs, or tokens — only
 * well-known HTTP status meanings plus a caller-provided
 * fallback.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (status === 404) {
      return "The requested item was not found.";
    }

    if (status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    if (status !== undefined && status >= 500) {
      return "Something went wrong on our side. Please try again.";
    }

    if (!error.response) {
      return "Network error. Please check your connection and try again.";
    }
  }

  return fallback;
}
