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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

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

  return (
    <div className="flex flex-col h-full bg-card text-text-primary">
      <div className="p-6 border-b border-border/50">
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
                "flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 font-semibold"
                  : "text-text-secondary hover:bg-muted",
                disabled && "opacity-40 cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-text-secondary")} />
              <span className="text-sm">{label}</span>
              {disabled && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest opacity-50 bg-muted px-1.5 py-0.5 rounded">Soon</span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border/50">
        <p className="text-[10px] text-center text-text-secondary font-medium uppercase tracking-[0.2em]">
          Finance Tracker v1.0
        </p>
      </div>
    </div>
  );
}
