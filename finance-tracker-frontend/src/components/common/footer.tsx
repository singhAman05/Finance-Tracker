"use client";

import Link from "next/link";
import { ShieldCheck, LifeBuoy, FileText, Activity } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto py-4 px-4 md:px-8 border-t border-border bg-background/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-text-secondary">
          <div className="font-bold flex items-center gap-2 text-text-primary tracking-tight">
            <Activity className="h-4 w-4 text-primary" />
            Finance Tracker
          </div>
          <span className="hidden md:inline text-border">•</span>
          <span className="text-xs">&copy; {currentYear} All rights reserved.</span>
        </div>

        {/* Right Side: Links & Systems */}
        <div className="flex items-center gap-4 md:gap-6 text-text-secondary font-medium text-xs">
          <Link href="#" className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Help & Support</span>
          </Link>
          <Link href="#" className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Privacy Policy</span>
          </Link>
          <Link href="#" className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Terms</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block"></div>
          
          <div className="flex items-center gap-2 text-success">
            <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-success"></span>
            </div>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
