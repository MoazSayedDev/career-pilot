import axios from "axios";

/**
 * Maps an API error to a well-known i18n error key, or null when the
 * error has no recognizable meaning.
 *
 * Never exposes response bodies, URLs, or tokens — only
 * well-known HTTP status meanings. Callers render the key through
 * the translator and supply their own localized fallback otherwise.
 */
export function getApiErrorKey(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return "errors.sessionExpired";
    }

    if (status === 403) {
      return "errors.forbidden";
    }

    if (status === 404) {
      return "errors.notFound";
    }

    if (status === 429) {
      return "errors.tooManyRequests";
    }

    if (status !== undefined && status >= 500) {
      return "errors.serverError";
    }

    if (!error.response) {
      return "errors.networkError";
    }
  }

  return null;
}

/**
 * Maps an API error to a safe, user-facing message: a localized
 * well-known status meaning, or the caller's already-localized fallback.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorKey(error) ?? fallback;
}
