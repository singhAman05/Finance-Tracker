import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import "../bones/registry";
import ReduxProvider from "./ReduxProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finance Tracker — Personal Finance Management",
  description: "Track your income, expenses, budgets, and bills in one place. Smart financial management for everyone.",
};

import { RootModal } from "@/components/modals/root-modal";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReduxProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <RootModal />
            <Toaster
              position="top-right"
              richColors={false}
              closeButton={false}
              expand={false}
              duration={3000}
            />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
