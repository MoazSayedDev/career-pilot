import { AlertCircle } from "lucide-react";

interface FieldProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}

export function Field({ label, required, children, error, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
