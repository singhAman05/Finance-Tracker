"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/common/sidebar";
import { MobileSidebar } from "@/components/common/mobileSidebar";
import { Menu, Wallet } from "lucide-react";
import { RootState } from "@/app/store";
import { fetchSettings } from "@/service/service_settings";
import { setSettings } from "@/components/redux/slices/slice_settings";
import { fetchAccounts } from "@/service/service_accounts";
import { fetchCategories } from "@/service/service_categories";
import { setAccounts } from "@/components/redux/slices/slice_accounts";
import { setCategories } from "@/components/redux/slices/slice_categories";

// Global init flag — prevents re-fetching across navigations within the same session
const BOOTSTRAP_KEY = "__ft_bootstrapped";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const bootstrapping = useRef(false);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const existingSettings = useSelector((state: RootState) => state.settings.settings);
  const existingAccounts = useSelector((state: RootState) => state.accounts.accounts);
  const existingCategories = useSelector((state: RootState) => state.categories.categories);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auth guard
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Bootstrap shared data ONCE per session — only fetch what's missing
  useEffect(() => {
    if (!isAuthenticated || bootstrapping.current) return;

    const needsSettings = !existingSettings;
    const needsAccounts = existingAccounts.length === 0;
    const needsCategories = existingCategories.length === 0;

    if (!needsSettings && !needsAccounts && !needsCategories) return;

    bootstrapping.current = true;

    const tasks: Promise<void>[] = [];

    if (needsSettings) {
      tasks.push(
        fetchSettings()
          .then((res) => {
            if (res?.data) dispatch(setSettings(res.data as any));
          })
          .catch(() => undefined)
      );
    }

    if (needsAccounts) {
      tasks.push(
        fetchAccounts()
          .then((res) => {
            const payload = Array.isArray(res?.data) ? res.data : [];
            dispatch(setAccounts(payload));
          })
          .catch(() => undefined)
      );
    }

    if (needsCategories) {
      tasks.push(
        fetchCategories()
          .then((res) => {
            const payload = Array.isArray(res?.data) ? res.data : [];
            dispatch(setCategories(payload));
          })
          .catch(() => undefined)
      );
    }

    void Promise.allSettled(tasks).finally(() => {
      bootstrapping.current = false;
    });
  }, [isAuthenticated, existingSettings, existingAccounts.length, existingCategories.length, dispatch]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-card/80 glass border-b border-border/40 flex items-center px-4 gap-3">
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 gradient-primary text-white rounded-lg flex items-center justify-center shadow-sm">
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

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pt-14 md:pt-0 transition-all scroll-smooth">
        {children}
      </main>
    </div>
  );
}