"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

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

  const expanded = !isCollapsed || isHoverExpand;

  const renderSection = (
    title: string,
    items: typeof navItems,
    className = "mt-6"
  ) => (
    <div className={className}>
      <h3
        className={cn(
          "px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-300",
          expanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 pointer-events-none"
        )}
      >
        {title}
      </h3>

      {items.map(({ label, icon: Icon, href }) => {
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "group flex items-center h-12 rounded-lg transition-colors duration-200",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex items-center w-full transition-all duration-300",
                expanded ? "px-4 justify-start" : "justify-center"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />

              <span
                className={cn(
                  "ml-3 whitespace-nowrap transition-all duration-300",
                  expanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                )}
              >
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-background border-r min-h-screen overflow-hidden",
        "transition-[width] duration-300 ease-in-out",
        expanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => isCollapsed && setIsHoverExpand(true)}
      onMouseLeave={() => setIsHoverExpand(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Wallet className="w-6 h-6 text-primary flex-shrink-0" />
          <span
            className={cn(
              "text-xl font-bold transition-all duration-300",
              expanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            )}
          >
            Finance
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ArrowLeftFromLine
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              expanded ? "rotate-0" : "rotate-180"
            )}
          />
        </button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {renderSection("Navigation", navItems, "mt-2")}
        {renderSection("Analytics", analyticsItems)}
        {renderSection("Planning", planningItems)}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-2 py-3">
        {utilityItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center h-12 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex items-center w-full transition-all duration-300",
                  expanded ? "px-4 justify-start" : "justify-center"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={cn(
                    "ml-3 transition-all duration-300",
                    expanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                  )}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
