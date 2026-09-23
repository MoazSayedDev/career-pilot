import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every route.
 *
 * - X-Content-Type-Options prevents MIME-type sniffing of API/HTML responses.
 * - X-Frame-Options denies clickjacking via iframe embedding (the app has
 *   no legitimate framing use case).
 * - Referrer-Policy avoids leaking full URLs (query strings can carry the
 *   ?redirect= and ?token= parameters) to third-party origins.
 * - Permissions-Policy disables powerful browser features the app never
 *   uses, so embedded third-party content cannot invoke them either.
 * - HSTS is inert over plain HTTP and becomes active the moment the app is
 *   served behind a TLS-terminating reverse proxy.
 *
 * A Content-Security-Policy is intentionally NOT set here: the app relies
 * on prerendered inline bootstrap scripts and framework-injected inline
 * scripts, which a static CSP cannot allowlist without 'unsafe-inline'
 * (no protection) or a per-request nonce layer (proxy/middleware overhead
 * on every request). Enforce CSP at the edge proxy (nginx/Caddy) with
 * report-only tuning before switching to enforce mode.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains;",
  },
] as const;

const nextConfig: NextConfig = {
  /**
   * Never advertise the framework/version (`X-Powered-By: Next.js`) —
   * it only helps attackers target known version-specific issues.
   */
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: [...SECURITY_HEADERS] }];
  },
};

export default nextConfig;
