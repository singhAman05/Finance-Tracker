// components/layout/dashboard-layout.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "../common/sidebar";
import { MobileSidebar } from "../common/mobileSidebar";
import { Menu } from "lucide-react";
import Dashboard from "./dashboardPage";

export function DashboardLayout() {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-primary text-white"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar (overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden">
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 transition-all">
        <Dashboard />
      </main>
    </div>
  );
}
