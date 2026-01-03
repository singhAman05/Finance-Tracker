// components/layout/dashboard-layout.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "../common/sidebar";
import { MobileSidebar } from "../common/mobileSidebar";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg bg-background border shadow-sm p-2"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl bg-background border shadow-sm p-4 md:p-6 min-h-[calc(100vh-3rem)]">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
