const BRAND_GRADIENT_ID = "careerpilot-brand-gradient";

/**
 * Brand mark: gold compass star inside a bearing ring on the Cockpit
 * gradient (deep navy → royal blue). The gradient <defs> id is shared by
 * every instance on the page, which is safe because all definitions are
 * identical.
 */
export function LogoMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={BRAND_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12264F" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${BRAND_GRADIENT_ID})`} />
      <circle
        cx="24"
        cy="24"
        r="12.5"
        stroke="#FBBF24"
        strokeWidth="1.6"
        opacity="0.85"
      />
      <path
        d="M24 14 26.3 21.7 34 24 26.3 26.3 24 34 21.7 26.3 14 24 21.7 21.7Z"
        fill="#FFFFFF"
      />
      <circle cx="32.85" cy="15.15" r="2.4" fill="#FBBF24" />
      <circle cx="24" cy="24" r="2.1" fill="#FBBF24" />
    </svg>
  );
}
