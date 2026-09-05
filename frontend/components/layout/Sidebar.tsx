"use client";

import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  FolderOpen,
  LogOut,
  FileText,
  Award,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/services/auth/api/auth.service";
import { LogoMark } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/utils";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/profile/contact-info", labelKey: "nav.personalInfo", icon: User },
  { href: "/profile/experience", labelKey: "nav.experience", icon: Briefcase },
  { href: "/profile/education", labelKey: "nav.education", icon: GraduationCap },
  { href: "/profile/skill", labelKey: "nav.skills", icon: Zap },
  { href: "/profile/projects", labelKey: "nav.projects", icon: FolderOpen },
  { href: "/profile/certificates", labelKey: "nav.certificates", icon: Award },
  { href: "/resume", labelKey: "nav.resume", icon: FileText },
];

export function Sidebar({
  onNavigate,
}: {
  /** Called after any navigation so mobile overlays can close themselves. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { t } = useI18n();

  const go = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Proceed to the login page even if the server call fails.
    } finally {
      onNavigate?.();
      router.push("/login");
    }
  };

  return (
    <aside className="w-[200px] flex-shrink-0 bg-white border-e border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <LogoMark size={32} className="flex-shrink-0" />

          <div>
            <p className="text-sm font-bold text-gray-900 leading-none dark:text-gray-100">
              CareerPilot
            </p>

            <p className="text-[10px] text-gray-400 mt-0.5 dark:text-gray-500">
              {t("brand.tagline")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <button
              key={href}
              onClick={() => go(href)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full text-start",
                active
                  ? "bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-950"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {t(labelKey)}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-0.5 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full text-start dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut size={16} />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
