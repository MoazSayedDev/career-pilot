import {
  LayoutDashboard, User, Briefcase, GraduationCap, Award, Zap,
  FolderOpen, Sparkles, LayoutTemplate, Eye, Download, Settings,
  LogOut, FileText,
} from "lucide-react";
import { cn } from "../../utils";
import type { Page } from "../../types";

const NAV_ITEMS = [
  { id: "dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { id: "personal-info", label: "Personal Info", icon: User },
  { id: "experience",    label: "Experience",    icon: Briefcase },
  { id: "education",     label: "Education",     icon: GraduationCap },
  { id: "certificates",  label: "Certificates",  icon: Award },
  { id: "skills",        label: "Skills",        icon: Zap },
  { id: "projects",      label: "Projects",      icon: FolderOpen },
  { id: "ai-summary",    label: "AI Summary",    icon: Sparkles },
  { id: "templates",     label: "Templates",     icon: LayoutTemplate },
  { id: "preview-cv",    label: "Preview CV",    icon: Eye },
  { id: "download-cv",   label: "Download CV",   icon: Download },
] as const;

interface SidebarProps {
  page: Page;
  onNav: (p: Page) => void;
  onLogout: () => void;
}

export function Sidebar({ page, onNav, onLogout }: SidebarProps) {
  return (
    <aside className="w-[200px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
            <FileText size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">CareerPilot</p>
            <p className="text-[10px] text-gray-400 mt-0.5">AI CV Builder</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id as Page)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left",
                active
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-0.5">
        <button
          onClick={() => onNav("settings")}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left",
            page === "settings"
              ? "bg-violet-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
