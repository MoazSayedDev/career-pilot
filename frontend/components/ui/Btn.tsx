import { cn } from "../../utils";

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    danger: "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100",
    secondary: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  );
}
