"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import {
  BarChart2,
  CreditCard,
  Banknote,
  ClipboardList,
  LineChart,
  Target,
  Calendar,
  Tag,
  Settings,
  Home,
  PiggyBank,
  ArrowLeftFromLine,
  Wallet,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useDispatch } from "react-redux";
import { logout } from "@/components/redux/slices/slice_auth";
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

const navItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Transactions", icon: CreditCard, href: "/dashboard/transactions" },
  { label: "Accounts", icon: Banknote, href: "/dashboard/accounts" },
  { label: "Budgets", icon: ClipboardList, href: "/budgets" },
];

const analyticsItems = [
  { label: "Reports", icon: LineChart, href: "/dashboard/reports" },
  { label: "Cash Flow", icon: BarChart2, href: "/cash-flow" },
];

const planningItems = [
  { label: "Goals", icon: Target, href: "/goals" },
  { label: "Bills", icon: Calendar, href: "/bills" },
  { label: "Investments", icon: PiggyBank, href: "/investments" },
];

const utilityItems = [
  { label: "Categories", icon: Tag, href: "/categories" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHoverExpand, setIsHoverExpand] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  const expanded = !isCollapsed || isHoverExpand;

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const renderSection = (
    title: string,
    items: typeof navItems,
    className = "mt-8"
  ) => (
    <div className={className}>
      <h3
        className={cn(
          "px-4 mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 transition-all duration-300",
          expanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
        )}
      >
        {title}
      </h3>

      {items.map(({ label, icon: Icon, href }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <div
            key={label}
            role="button"
            onClick={() => {
              startTransition(() => {
                router.push(href);
              });
            }}
            className={cn(
              "group flex items-center h-10 mx-2 rounded-lg transition-all duration-200 mb-1 px-3",
              isActive
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
            )}
          >
            <div className="flex items-center w-full gap-3">
              <Icon
                className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200",
                  !isActive && "group-hover:scale-105"
                )}
              />

              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap transition-all duration-300",
                  expanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 min-h-screen overflow-hidden relative",
        "transition-[width] duration-300 ease-in-out shadow-sm",
        expanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => isCollapsed && setIsHoverExpand(true)}
      onMouseLeave={() => setIsHoverExpand(false)}
    >
      {/* Header */}
      <div className="h-20 flex items-center px-4 shrink-0 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105 active:scale-95">
            <Wallet className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <span
            className={cn(
              "text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300",
              expanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            )}
          >
            Finance
          </span>
        </div>

        {expanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="ml-auto p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all active:scale-90"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ArrowLeftFromLine className="w-4 h-4" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 px-1">
        {renderSection("Navigation", navItems, "mt-6")}
        {renderSection("Analytics", analyticsItems)}
        {renderSection("Planning", planningItems)}
      </ScrollArea>

      {/* Footer Section */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 px-1 pt-4 pb-6 bg-slate-50/30 dark:bg-slate-900/20 space-y-3">
        {utilityItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href);

          return (
            <div
              key={label}
              role="button"
              onClick={() => {
                startTransition(() => {
                  router.push(href);
                });
              }}
              className={cn(
                "group flex items-center h-10 mx-2 rounded-lg transition-all duration-200 px-3",
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center w-full gap-3">
                <Icon className="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105" />

                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-all duration-300",
                    expanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Theme Toggle Button - Professional Design */}
        <div
          role="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "group flex items-center h-10 mx-2 rounded-lg transition-all duration-200 px-3",
            "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
          )}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          <div className="flex items-center w-full gap-3">
            <div className="relative w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105">
              <Sun
                className={cn(
                  "w-[18px] h-[18px] absolute transition-all duration-300 ease-in-out",
                  isDark
                    ? "opacity-0 -rotate-90"
                    : "opacity-100 rotate-0 text-amber-500"
                )}
              />
              <Moon
                className={cn(
                  "w-[18px] h-[18px] absolute transition-all duration-300 ease-in-out",
                  isDark
                    ? "opacity-100 rotate-0 text-blue-300"
                    : "opacity-0 rotate-90"
                )}
              />
            </div>

            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-300",
                expanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              )}
            >
              {isDark ? "Dark" : "Light"}
            </span>

            <div
              className={cn(
                "ml-auto relative w-10 h-5 flex items-center transition-all duration-300",
                expanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              )}
            >
              <div className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300" />
              <div
                className={cn(
                  "absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 rounded-full shadow-sm transition-all duration-300 ease-in-out",
                  isDark ? "translate-x-7" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div
          role="button"
          onClick={handleLogout}
          className="group flex items-center h-10 mx-2 rounded-lg transition-all duration-200 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 dark:text-red-400"
        >
          <div className="flex items-center w-full gap-3">
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:-translate-x-1" />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-300",
                expanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              )}
            >
              Sign Out
            </span>
          </div>
        </div>
      </div>


      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Sign out confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to sign out? You will be redirected to the
              home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 border-0"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
