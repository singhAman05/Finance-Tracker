"use client";

import { useState } from "react";
import { Sidebar } from "@/components/common/sidebar";
import { MobileSidebar } from "@/components/common/mobileSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-primary text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm">
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-6 transition-all scroll-smooth">
        {children}
      </main>
    </div>
  );
}
