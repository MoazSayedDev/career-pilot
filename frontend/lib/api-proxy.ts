/**
 * Same-origin API proxy core.
 *
 * Every frontend request to `/api/*` goes through `forwardUpstream`, which
 * relays it to the backend target (`API_PROXY_TARGET`, falling back to the
 * production backend host). `handleGoogleCallback` wraps the Google OAuth
 * callback navigation so the popup closes instead of showing raw JSON.
 *
 * Why a proxy instead of calling the backend directly:
 *  - The refresh-token cookie must live on THIS origin so the server-side
 *    route protection in `proxy.ts` can read it. Cookies are origin-scoped;
 *    a cookie set by the backend's own domain is invisible to this server.
 *  - Same-origin requests need no CORS configuration at all.
 *  - `Set-Cookie` headers coming back from the backend are rewritten here
 *    (domain stripped, `SameSite=Lax`, `Path=/`, `Secure` when the request
 *    itself arrived over HTTPS) so the browser stores them for this origin.
 *
 * Everything else passes through untouched: method, query string, body
 * bytes, status code, and all non hop-by-hop headers — including
 * `Authorization` (JWT access token) and `Cookie` (refresh token sent back
 * to the backend for rotation). Redirects (the Google OAuth entry point)
 * are passed through with `redirect: "manual"` so the browser follows them
 * itself instead of the proxy consuming them.
 */

/** Structural view of a request — `NextRequest` satisfies it. */
export interface ProxyRequest {
  method: string;
  url: string;
  headers: Headers;
  nextUrl: { pathname: string; search: string };
  arrayBuffer(): Promise<ArrayBuffer>;
}

const TARGET =
  process.env.API_PROXY_TARGET ?? "https://career-pilot-prod.duckdns.org";

/** Path this app exposes for the Google OAuth callback navigation. */
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

/**
 * Request headers that must not be forwarded: hop-by-hop headers plus the
 * ones the outbound fetch must compute itself (length, encoding) and
 * browser-context headers (`origin`, `referer`) that would only confuse
 * the backend's CORS layer — this call is server-to-server now.
 */
const REQUEST_HEADER_SKIP = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "accept-encoding",
  "origin",
  "referer",
]);

/**
 * Response headers dropped before replying to the browser: hop-by-hop
 * headers, framing headers fetch/undici re-computes, and the CORS headers
 * the backend emits for the direct-call architecture — meaningless (and
 * misleading) on a same-origin response.
 */
const RESPONSE_HEADER_SKIP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  "set-cookie", // rewritten below
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-expose-headers",
  "access-control-max-age",
]);

/** Strip CR/LF — cookie attribute values must never carry them. */
const sanitize = (value: string) => value.replace(/[\r\n]+/g, "").trim();

/**
 * Rewrites one `Set-Cookie` header from the backend so the cookie is
 * stored for THIS origin instead of the backend's:
 *  - `Domain` is dropped entirely (defaults to the frontend host).
 *  - `Path=/` so it reaches `proxy.ts` on every protected route.
 *  - `SameSite=Lax`: the cookie is same-origin now; Lax keeps it on
 *    top-level navigations (so route protection works) while hardening
 *    it against cross-site sending.
 *  - `Secure` only when the request arrived over HTTPS (behind the
 *    production reverse proxy) — plain-HTTP local development would
 *    otherwise have the cookie silently dropped by the browser.
 *  - `HttpOnly` and the backend's lifetime (`Max-Age`/`Expires`) are kept.
 */
const rewriteSetCookie = (cookie: string, secure: boolean): string => {
  const [nameValue, ...attributes] = cookie.split(";");
  const separator = nameValue.indexOf("=");
  const name = sanitize(
    separator === -1 ? nameValue : nameValue.slice(0, separator),
  );
  const value = sanitize(
    separator === -1 ? "" : nameValue.slice(separator + 1),
  );

  const parts = [`${name}=${value}`, "Path=/"];
  if (secure) parts.push("Secure");
  parts.push("SameSite=Lax");

  const lowercased = attributes.map((attribute) =>
    sanitize(attribute).toLowerCase(),
  );
  if (lowercased.includes("httponly")) parts.push("HttpOnly");
  for (const attribute of attributes) {
    const lowered = sanitize(attribute).toLowerCase();
    if (lowered.startsWith("max-age=") || lowered.startsWith("expires=")) {
      parts.push(sanitize(attribute));
    }
  }

  return parts.join("; ");
};

const isSecureRequest = (request: ProxyRequest): boolean => {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return new URL(request.url).protocol === "https:";
};

/**
 * Forwards `/api/<rest>` → `<TARGET>/<rest>` and returns the upstream
 * response with its status, headers and body intact (Set-Cookie rewritten
 * for this origin, CORS/hop-by-hop headers stripped). Never throws: an
 * unreachable backend surfaces as a real 502.
 */
export const forwardUpstream = async (
  request: ProxyRequest,
): Promise<Response> => {
  const { pathname, search } = request.nextUrl;
  const upstreamUrl = `${TARGET}${pathname.replace(/^\/api/, "")}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!REQUEST_HEADER_SKIP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  // `x-forwarded-for` (if present) is forwarded with the other headers,
  // preserving client identity for backend logging/rate limiting.

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      credentials: "omit",
    });
  } catch {
    // Upstream unreachable: surface a real 502, never swallow the error.
    return Response.json(
      { success: false, message: "Bad gateway: upstream API unreachable" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!RESPONSE_HEADER_SKIP.has(key.toLowerCase())) {
      responseHeaders.append(key, value);
    }
  });

  const secure = isSecureRequest(request);
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", rewriteSetCookie(cookie, secure));
  }

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};

/**
 * Completion page for the Google OAuth callback navigation.
 *
 * This is now a TOP-LEVEL navigation (no popup — the backend owns the
 * OAuth callback URL, so the round-trip may leave this origin and only a
 * full-page flow survives that). The backend's JSON body is replaced by
 * this page, which carries the rewritten `Set-Cookie` headers so the
 * refresh cookie is stored for THIS origin, then bounces the tab to the
 * login page with a `logged_in` flag. The login page verifies the
 * session (`/auth/refresh` + `/auth/me`) and continues to the dashboard.
 *
 * A `meta` refresh does the redirect even if scripting is disabled.
 */
const completionPage = (success: boolean): string => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=/login?logged_in=${success ? 1 : 0}">
    <title>Signing you in…</title>
  </head>
  <body>
    <script>
      window.location.replace("/login?logged_in=${success ? 1 : 0}");
    </script>
  </body>
</html>`;

/**
 * Handles the OAuth callback navigation on this origin.
 *
 * The callback MUST still be forwarded to the backend — that call is what
 * exchanges the Google code for the session and emits the refresh-token
 * cookie. The backend's JSON response is then replaced by the completion
 * page, which carries the rewritten `Set-Cookie` headers so the browser
 * stores the refresh cookie for this origin while the popup closes.
 *
 * A non-2xx upstream (e.g. the user denied consent) still yields the
 * completion page — with `success: false` — so the popup never hangs; the
 * actual failure is then surfaced by the `/auth/refresh` round-trip.
 */
export const handleGoogleCallback = async (
  request: ProxyRequest,
): Promise<Response> => {
  const upstream = await forwardUpstream(request);

  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  // Already rewritten for this origin by `forwardUpstream`.
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }

  return new Response(completionPage(upstream.ok), {
    status: 200,
    headers,
  });
};
