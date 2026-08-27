import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "../../utils";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  icon?: ReactNode;
  className?: string;
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | ((value: string) => void);
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = "", onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) {
        return;
      }

      const callback = onChange as (value: string | ChangeEvent<HTMLInputElement>) => void;
      const source = callback.toString();
      const usesEventTarget =
        /\b(event|e)\.target(\.value)?\b/.test(source) ||
        /target\.value/.test(source) ||
        /shouldValidate|setValue/.test(source);

      try {
        if (usesEventTarget) {
          callback(event);
          return;
        }
      } catch {
        // Fall back to the value-only callback style below.
      }

      callback(event.target.value);
    };

    const inputClassName = cn(
      "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors",
      "disabled:bg-gray-50 disabled:text-gray-400",
      icon && "pl-9",
      className,
    );

    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          {...props}
          onChange={handleChange}
          className={inputClassName}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
