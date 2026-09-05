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
import { cn } from "@/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/profile/contact-info",
    label: "Personal Info",
    icon: User,
  },
  {
    href: "/profile/experience",
    label: "Experience",
    icon: Briefcase,
  },
  {
    href: "/profile/education",
    label: "Education",
    icon: GraduationCap,
  },
  {
    href: "/profile/skill",
    label: "Skills",
    icon: Zap,
  },
  {
    href: "/profile/projects",
    label: "Projects",
    icon: FolderOpen,
  },
  {
    href: "/profile/certificates",
    label: "Certificates",
    icon: Award,
  },
  {
    href: "/resume",
    label: "Resume",
    icon: FileText,
  },
];

export function Sidebar({
  onNavigate,
}: {
  /** Called after any navigation so mobile overlays can close themselves. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

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
    <aside className="w-[200px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
            <FileText size={15} className="text-white" />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">
              CareerPilot
            </p>

            <p className="text-[10px] text-gray-400 mt-0.5">AI CV Builder</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <button
              key={href}
              onClick={() => go(href)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left",
                active
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-0.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
