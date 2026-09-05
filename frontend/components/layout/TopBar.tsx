"use client";

import { ChevronRight, Menu } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { useUserInfo } from "@/components/layout/UserInfo";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout/Controls";
import { useI18n } from "@/lib/i18n/I18nProvider";

const BREADCRUMB_KEYS: Record<string, string> = {
  "/dashboard": "nav.dashboard",

  "/profile": "nav.personalInfo",
  "/profile/certificates": "nav.certificates",
  "/profile/contact-info": "nav.contactInfo",
  "/profile/education": "nav.education",
  "/profile/experience": "nav.experience",
  "/profile/projects": "nav.projects",
  "/profile/skill": "nav.skills",

  "/resume": "nav.resume",
  "/resume/preview": "nav.resumePreview",
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { t } = useI18n();

  const { name, headline, initials, loading } = useUserInfo();

  const currentPage = BREADCRUMB_KEYS[pathname]
    ? t(BREADCRUMB_KEYS[pathname])
    : t("nav.dashboard");

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 dark:bg-gray-900 dark:border-gray-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 dark:text-gray-400">
        <button
          type="button"
          aria-label={t("nav.openMenu")}
          onClick={onMenuClick}
          className="md:hidden -ms-1 p-1 text-gray-600 hover:text-blue-700 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
        >
          <Menu size={18} />
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-blue-700 transition-colors dark:hover:text-blue-400"
        >
          {t("nav.dashboard")}
        </button>

        {pathname !== "/dashboard" && (
          <>
            <ChevronRight
              size={14}
              className="rtl-flip text-gray-300 flex-shrink-0 dark:text-gray-600"
            />

            <span className="text-gray-900 font-medium truncate dark:text-gray-100">
              {currentPage}
            </span>
          </>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <ThemeToggle />

        <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
          {loading ? "" : initials || "?"}
        </div>

        <div className="hidden md:block">
          {loading ? (
            <>
              <div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />

              <div className="mt-1.5 h-2.5 w-20 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 leading-none dark:text-gray-100">
                {name || t("common.guest")}
              </p>

              {headline && (
                <p className="text-[10px] text-gray-400 mt-0.5 dark:text-gray-500">
                  {headline}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
