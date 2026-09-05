import { LogoMark } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout/Controls";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center px-4 py-12 dark:bg-gray-950">
      {/* Language & theme controls */}
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2.5">
            <LogoMark size={40} />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              CareerPilot
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <Card className="border border-slate-200 p-6 shadow-lg shadow-gray-100 sm:p-8 dark:border-gray-800 dark:shadow-black/30">
          {children}
        </Card>
      </div>
    </div>
  );
}
