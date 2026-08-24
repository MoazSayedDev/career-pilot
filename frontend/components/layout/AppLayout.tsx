import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { Page } from "../../types";

interface AppLayoutProps {
  page: Page;
  onNav: (p: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({ page, onNav, onLogout, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      <Sidebar page={page} onNav={onNav} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar page={page} onNav={onNav} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
