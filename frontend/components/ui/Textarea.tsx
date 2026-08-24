interface TextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}: TextareaProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
      />
      {maxLength && (
        <span className="absolute bottom-2 right-2.5 text-xs text-gray-400">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
