import type { NextRequest } from "next/server";

import {
  GOOGLE_CALLBACK_PATH,
  forwardUpstream,
  handleGoogleCallback,
} from "@/lib/api-proxy";

/**
 * Same-origin API proxy (catch-all Route Handler) — logic lives in
 * `lib/api-proxy.ts` so it can be unit-tested (`tests/api-proxy.test.ts`).
 *
 * The Google OAuth callback navigation is intercepted so the browser gets
 * a redirect back into the app (with the session cookie attached) instead
 * of the backend's raw JSON; every other `/api/*` request is forwarded to
 * the backend as-is with `Set-Cookie` rewritten for this origin.
 */
const proxyRequest = async (request: NextRequest): Promise<Response> => {
  if (request.method === "GET" && request.nextUrl.pathname === GOOGLE_CALLBACK_PATH) {
    return handleGoogleCallback(request);
  }

  return forwardUpstream(request);
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;

export const dynamic = "force-dynamic";
