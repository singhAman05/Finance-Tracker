"use client";

import { useState } from "react";
import { Sidebar } from "../common/sidebar";
import { MobileSidebar } from "../common/mobileSidebar";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-text-primary">
      {/* Sidebar: Fixed and rigid */}
      <aside className="hidden md:flex flex-col h-full shrink-0 z-40">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Mobile Header: Minimalist */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>
          <span className="text-sm font-semibold tracking-tight text-text-primary">Finance</span>
          <div className="w-9" /> {/* Spacer for balance */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 md:p-10 lg:p-12">
            <div className="mx-auto max-w-[1400px]">
              {/* Content Card: Clean borders, no heavy shadows */}
              <div className="min-h-[calc(100vh-10rem)] transition-all duration-500 ease-in-out">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-300">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
