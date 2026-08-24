import { Bell, ChevronDown, ChevronRight, Eye, Download } from "lucide-react";
import { Btn } from "../ui/Btn";
import { cn } from "../../utils";
import type { Page } from "../../types";

const BREADCRUMBS: Record<string, string[]> = {
  dashboard: ["Dashboard"],
  "personal-info": ["Dashboard", "Personal Info"],
  experience: ["Dashboard", "Experience"],
  education: ["Dashboard", "Education"],
  certificates: ["Dashboard", "Certificates"],
  skills: ["Dashboard", "Skills"],
  projects: ["Dashboard", "Projects"],
  "ai-summary": ["Dashboard", "AI Summary"],
  templates: ["Dashboard", "Templates"],
  "preview-cv": ["Dashboard", "Preview CV"],
  "download-cv": ["Dashboard", "Download CV"],
  settings: ["Dashboard", "Settings"],
};

interface TopBarProps {
  page: Page;
  onNav: (p: Page) => void;
}

export function TopBar({ page, onNav }: TopBarProps) {
  const crumbs = BREADCRUMBS[page] || ["Dashboard"];

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
            <span
              className={cn(
                i === crumbs.length - 1
                  ? "text-gray-900 font-medium"
                  : "hover:text-violet-600 cursor-pointer",
              )}
            >
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Btn size="sm" variant="outline" onClick={() => onNav("preview-cv")}>
          <Eye size={14} />
          Preview CV
        </Btn>
        <Btn size="sm" onClick={() => onNav("download-cv")}>
          <Download size={14} />
          Download CV
        </Btn>

        {/* Bell */}
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
