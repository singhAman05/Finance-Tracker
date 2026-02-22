"use client";

import { useState } from "react";
import { Sidebar } from "../common/sidebar";
import { MobileSidebar } from "../common/mobileSidebar";
import { Menu, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-text-primary">
      {/* Sidebar: Fixed and rigid */}
      <aside className="hidden md:flex flex-col h-full shrink-0 z-40">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Mobile Header: Enhanced visibility and standard burger placement */}
        <header className="md:hidden flex items-center h-16 px-6 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-primary-foreground" />
             </div>
             <span className="text-base font-bold tracking-tight">Finance</span>
          </div>
          
          <button
            onClick={() => setMobileOpen(true)}
            className="ml-auto p-2.5 bg-muted/50 hover:bg-muted rounded-xl transition-all active:scale-95 shadow-sm"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-text-primary" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 sm:p-6 md:p-10 lg:p-12">
            <div className="mx-auto max-w-[1400px]">
              {/* Content area padding adjusted for mobile */}
              <div className="min-h-[calc(100vh-12rem)] transition-all duration-500 ease-in-out">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-[300px] bg-card border-r border-border shadow-2xl overflow-hidden"
            >
              <MobileSidebar onClose={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
