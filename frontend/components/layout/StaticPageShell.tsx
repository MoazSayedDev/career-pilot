"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/Controls";
import { LogoMark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/Controls";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Shared shell for the public legal/info pages (privacy, terms, contact).
 * Renders localized section content passed by the page.
 */
export function StaticPageShell({
  title,
  updated,
  sections,
  children,
}: {
  title: string;
  updated?: string;
  sections: Array<{ heading: string; body: string[] }>;
  children?: React.ReactNode;
}) {
  const { t, dir } = useI18n();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-gray-950">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 dark:bg-gray-950/90 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-gray-700 hover:text-blue-700 transition-colors dark:text-gray-200 dark:hover:text-blue-400"
          >
            <BackArrow size={18} className="rtl-flip" />
            <LogoMark size={28} />
            <span className="font-bold text-gray-900 dark:text-gray-100">
              CareerPilot
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {updated && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{updated}</p>
        )}

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {section.heading}
              </h2>
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          {children}
        </div>
      </main>
    </div>
  );
}
