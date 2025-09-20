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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Transactions", icon: CreditCard, href: "/transactions" },
    { label: "Accounts", icon: Banknote, href: "/accounts" },
    { label: "Budgets", icon: ClipboardList, href: "/budgets" },
    { label: "Reports", icon: LineChart, href: "/reports" },
    { label: "Cash Flow", icon: BarChart2, href: "/cash-flow" },
    { label: "Goals", icon: Target, href: "/goals" },
    { label: "Bills", icon: Calendar, href: "/bills" },
    { label: "Investments", icon: PiggyBank, href: "/investments" },
    { label: "Categories", icon: Tag, href: "/categories" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Finance Tracker</div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-60px)] p-2">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted transition-all",
                isActive && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
