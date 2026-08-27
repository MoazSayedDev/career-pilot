"use client";

import { Bell, ChevronDown, ChevronRight, Eye, Download } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { Btn } from "@/components/ui/Btn";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",

  "/profile": "Personal Info",
  "/profile/contact-info": "Contact Info",
  "/profile/education": "Education",
  "/profile/experience": "Experience",
  "/profile/language": "Language",
  "/profile/projects": "Projects",
  "/profile/skill": "Skills",
};

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const currentPage =
    BREADCRUMBS[pathname as keyof typeof BREADCRUMBS] || "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-violet-600 transition-colors"
        >
          Dashboard
        </button>

        {pathname !== "/dashboard" && (
          <>
            <ChevronRight size={14} className="text-gray-300" />

            <span className="text-gray-900 font-medium">{currentPage}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Btn
          size="sm"
          variant="outline"
          onClick={() => router.push("/dashboard/preview-cv")}
        >
          <Eye size={14} />
          Preview CV
        </Btn>

        <Btn size="sm" onClick={() => router.push("/dashboard/download-cv")}>
          <Download size={14} />
          Download CV
        </Btn>

        {/* Notification */}
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors relative">
          <Bell size={15} />

          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            SJ
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 leading-none">
              Sarah Johnson
            </p>

            <p className="text-[10px] text-gray-400">Frontend Developer</p>
          </div>

          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
