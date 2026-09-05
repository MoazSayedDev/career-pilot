import { Lightbulb } from "lucide-react";

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tipText?: string;
}

export function PageHeader({ icon, title, subtitle, tipText }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {tipText && (
        <div className="hidden lg:flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-xs">
          <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Tips</p>
            <p className="text-xs text-amber-700 mt-0.5">{tipText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
