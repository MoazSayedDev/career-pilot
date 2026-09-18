"use client";

import { cn } from "@/utils";
import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useCallback, useId, useState } from "react";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Optional leading icon. Defaults to a Lock icon when omitted. */
  icon?: React.ReactNode;
  /** Icon size for the Eye / EyeOff toggle (px). @default 15 */
  toggleSize?: number;
}

/**
 * A secure, reusable password input with a built-in show/hide toggle.
 *
 * - Renders `type="password"` by default; the user can toggle to `type="text"`.
 * - Includes an accessible, keyboard-navigable toggle button with `aria-label`.
 * - Forwards refs so it integrates seamlessly with react-hook-form's `register`.
 * - Memoises the toggle handler to avoid unnecessary re-renders.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, icon, toggleSize = 15, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = useId();

    const handleToggle = useCallback(() => {
      setVisible((prev) => !prev);
    }, []);

    const leadingIcon = icon ?? <Lock size={15} />;

    return (
      <div className="relative">
        {/* Leading icon */}
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {leadingIcon}
        </span>

        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "off"}
          disabled={disabled}
          {...props}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white ps-9 pe-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors",
            className,
          )}
        />

        {/* Show / Hide toggle */}
        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggle}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-200"
        >
          {visible ? <EyeOff size={toggleSize} /> : <Eye size={toggleSize} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
export type { PasswordInputProps };
