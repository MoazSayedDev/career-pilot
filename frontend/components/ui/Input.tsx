"use client";

import { cn } from "@/utils";
import { forwardRef } from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon rendered inside the field on the left. */
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>

          <input
            ref={ref}
            {...props}
            className={cn(
              "w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors",
              className,
            )}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors",
          className,
        )}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
