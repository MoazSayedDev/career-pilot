import { cn } from "../../utils";

interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  className = "",
  disabled = false,
  maxLength,
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors",
          "disabled:bg-gray-50 disabled:text-gray-400",
          icon && "pl-9",
          className
        )}
      />
    </div>
  );
}
