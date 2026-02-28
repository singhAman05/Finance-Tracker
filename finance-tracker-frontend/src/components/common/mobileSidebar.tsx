// components/layout/mobile-sidebar.tsx
"use client";

import {
  X,
  Home,
  CreditCard,
  Banknote,
  ClipboardList,
  LineChart,
  Target,
  Calendar,
  PiggyBank,
  Tag,
  Settings,
  BarChart2,
  Wallet,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useDispatch } from "react-redux";
import { logout } from "@/components/redux/slices/slice_auth";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isDark = resolvedTheme === "dark";

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Transactions", icon: CreditCard, href: "/dashboard/transactions" },
    { label: "Accounts", icon: Banknote, href: "/dashboard/accounts" },
    { label: "Budgets", icon: ClipboardList, href: "/dashboard/budgets" },
    { label: "Bills", icon: Calendar, href: "/dashboard/bills" },
    { label: "Reports", icon: LineChart, href: "/dashboard/reports" },
    { label: "Cash Flow", icon: BarChart2, href: "/cash-flow", disabled: true },
    { label: "Goals", icon: Target, href: "/goals", disabled: true },
    { label: "Investments", icon: PiggyBank, href: "/investments", disabled: true },
    { label: "Categories", icon: Tag, href: "/categories", disabled: true },
    { label: "Settings", icon: Settings, href: "/settings", disabled: true },
  ];

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    onClose();
    router.push("/");
  };

  return (
    <>
      <div className="flex flex-col h-full w-72 bg-card text-text-primary shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Finance</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ label, icon: Icon, href, disabled }) => {
            const isActive = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

            return (
              <Link
                key={label}
                href={disabled ? "#" : href}
                onClick={() => !disabled && onClose()}
                className={cn(
                  "flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 font-semibold"
                    : "text-text-secondary hover:bg-muted",
                  disabled && "opacity-40 cursor-not-allowed grayscale pointer-events-none"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "text-text-secondary")} />
                <span className="text-sm">{label}</span>
                {disabled && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest opacity-50 bg-muted px-1.5 py-0.5 rounded">Soon</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer: Theme + Logout */}
        <div className="p-4 border-t border-border/50 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-text-secondary hover:bg-muted transition-all duration-200"
          >
            <div className="relative w-5 h-5 shrink-0">
              <Sun className={cn("w-5 h-5 absolute transition-all duration-300", isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0 text-amber-500")} />
              <Moon className={cn("w-5 h-5 absolute transition-all duration-300", isDark ? "opacity-100 rotate-0 text-blue-300" : "opacity-0 rotate-90")} />
            </div>
            <span className="text-sm font-medium">{isDark ? "Dark Mode" : "Light Mode"}</span>
            <div className="ml-auto relative w-9 h-4 flex items-center">
              <div className={cn("w-full h-[6px] rounded-full transition-colors", isDark ? "bg-blue-300/30" : "bg-amber-500/30")} />
              <div className={cn("absolute w-3 h-3 rounded-full shadow-sm transition-all duration-300", isDark ? "translate-x-5 bg-blue-300" : "translate-x-0.5 bg-amber-500")} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-danger hover:bg-danger/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform hover:-translate-x-1" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>

          <p className="text-[10px] text-center text-text-secondary font-medium uppercase tracking-[0.2em] pt-1">
            Finance Tracker v1.0
          </p>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Sign out confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              Are you sure you want to sign out? You will be redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-text-primary hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-danger text-white hover:bg-danger/90 border-0">
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
