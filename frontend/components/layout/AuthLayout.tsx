import { FileText } from "lucide-react";

import { Card } from "@/components/ui/Card";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-200">
              <FileText size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CareerPilot</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <Card className="border border-slate-200 p-6 shadow-lg shadow-gray-100 sm:p-8">
          {children}
        </Card>
      </div>
    </div>
  );
}
