"use client";

import { cn } from "@/utils";
import { forwardRef } from "react";

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
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
});

Input.displayName = "Input";

export { Input };
