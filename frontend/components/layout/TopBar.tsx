"use client";

import { ChevronRight, Menu } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { useUserInfo } from "@/components/layout/UserInfo";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",

  "/profile": "Personal Info",
  "/profile/certificates": "Certificates",
  "/profile/contact-info": "Contact Info",
  "/profile/education": "Education",
  "/profile/experience": "Experience",
  "/profile/projects": "Projects",
  "/profile/skill": "Skills",

  "/resume": "Resume",
  "/resume/preview": "Resume Preview",
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const { name, headline, initials, loading } = useUserInfo();

  const currentPage =
    BREADCRUMBS[pathname as keyof typeof BREADCRUMBS] || "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="md:hidden -ml-1 p-1 text-gray-600 hover:text-blue-700 transition-colors"
        >
          <Menu size={18} />
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-blue-700 transition-colors"
        >
          Dashboard
        </button>

        {pathname !== "/dashboard" && (
          <>
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />

            <span className="text-gray-900 font-medium truncate">
              {currentPage}
            </span>
          </>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
          {loading ? "" : initials || "?"}
        </div>

        <div className="hidden md:block">
          {loading ? (
            <>
              <div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse" />

              <div className="mt-1.5 h-2.5 w-20 rounded bg-gray-100 animate-pulse" />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 leading-none">
                {name || "Guest"}
              </p>

              {headline && (
                <p className="text-[10px] text-gray-400 mt-0.5">{headline}</p>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
