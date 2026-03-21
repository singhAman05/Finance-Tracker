"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sidebar } from "@/components/common/sidebar";
import { MobileSidebar } from "@/components/common/mobileSidebar";
import { Menu, Wallet } from "lucide-react";
import { RootState } from "@/app/store";
import { fetchSettings } from "@/service/service_settings";
import { setSettings } from "@/components/redux/slices/slice_settings";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const [isMobileOpen, setMobileOpen] = useState(false);
  const existingSettings = useSelector((state: RootState) => state.settings.settings);

  // Load user settings on first mount so useCurrency/useDateFormat
  // work on every page without requiring a visit to /settings first.
  useEffect(() => {
    if (!existingSettings) {
      fetchSettings().then((data) => {
        if (data) dispatch(setSettings(data));
      });
    }
  }, [dispatch, existingSettings]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Top Header Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-card/90 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-text-primary">Finance</span>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm">
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto pt-14 md:pt-0 transition-all scroll-smooth">
        {children}
      </main>
    </div>
  );
}
