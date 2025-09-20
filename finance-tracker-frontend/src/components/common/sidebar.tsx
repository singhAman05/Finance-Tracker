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
  HandCoins,
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
  { label: "Reports", icon: LineChart, href: "/reports" },
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
  const [isHovering, setIsHovering] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsCollapsed(true);
  };

  const renderSection = (
    title: string,
    items: typeof navItems,
    sectionClass: string = "mt-6"
  ) => (
    <div className={sectionClass}>
      {!isCollapsed && (
        <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      {items.map(({ label, icon: Icon, href }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex items-center h-12 hover:bg-muted rounded-lg transition-colors duration-200",
              isActive && "bg-primary/10 text-primary font-medium"
            )}
          >
            <div
              className={cn(
                "flex items-center w-full",
                isCollapsed ? "justify-center" : "justify-start px-4"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  "ml-3 overflow-hidden transition-all duration-300",
                  isCollapsed
                    ? "max-w-0 opacity-0"
                    : "max-w-[200px] opacity-100"
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
        "hidden md:flex flex-col bg-background border-r min-h-screen transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 flex items-center justify-between">
        {isCollapsed ? (
          <div className="p-2">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
        ) : (
          <div className="text-xl font-bold">Finance</div>
        )}
        <button
          onClick={toggleCollapse}
          className={cn(
            "p-1.5 rounded-md hover:bg-muted transition-colors",
            isCollapsed ? "ml-0" : "ml-2"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ArrowLeftFromLine className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {renderSection("Navigation", navItems, "mt-2")}
        {renderSection("Analytics", analyticsItems)}
        {renderSection("Planning", planningItems)}
      </ScrollArea>

      <div className="mt-auto border-t border-border">
        <div className="px-2 py-3">
          {utilityItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center h-12 hover:bg-muted rounded-lg transition-colors duration-200",
                  isActive && "bg-primary/10 text-primary font-medium"
                )}
              >
                <div
                  className={cn(
                    "flex items-center w-full",
                    isCollapsed ? "justify-center" : "justify-start px-4"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={cn(
                      "ml-3 overflow-hidden transition-all duration-300",
                      isCollapsed
                        ? "max-w-0 opacity-0"
                        : "max-w-[200px] opacity-100"
                    )}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
