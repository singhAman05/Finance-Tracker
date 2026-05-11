"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Back to login
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Image src="/icon.svg" alt="Fintrak logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Privacy Policy</h1>
          </div>

          <p className="text-sm text-text-secondary mb-10">Last updated: May 7, 2026</p>

          <div className="prose prose-sm max-w-none space-y-8 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">1. Information We Collect</h2>
              <p>We collect the following information when you use Fintrak:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-text-primary">Account Information:</strong> Phone number, email address, and name (via Google OAuth).</li>
                <li><strong className="text-text-primary">Financial Data:</strong> Transaction records, account balances, budgets, and bills you manually enter.</li>
                <li><strong className="text-text-primary">Usage Data:</strong> Pages visited, feature usage patterns, and performance metrics.</li>
                <li><strong className="text-text-primary">Device Information:</strong> Browser type, operating system, and screen resolution for optimization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide and maintain the financial tracking service.</li>
                <li>To generate insights, reports, and budget alerts personalized to you.</li>
                <li>To improve the Service through anonymized, aggregated analytics.</li>
                <li>To send important notifications about your account (bill reminders, budget alerts).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">3. Data Storage & Security</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All data is encrypted in transit (TLS 1.3) and at rest.</li>
                <li>Database hosted on Supabase with row-level security (RLS) policies.</li>
                <li>Authentication uses secure httpOnly JWT cookies.</li>
                <li>We perform regular security audits and dependency vulnerability scans.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">4. Data Sharing</h2>
              <p>We do <strong className="text-text-primary">not</strong> sell, rent, or trade your personal or financial data. We may share data only:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>With service providers essential to operating the platform (hosting, email delivery).</li>
                <li>When required by law or to protect our legal rights.</li>
                <li>With your explicit consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-text-primary">Access:</strong> Export all your data at any time from Settings.</li>
                <li><strong className="text-text-primary">Correct:</strong> Update your profile and account information.</li>
                <li><strong className="text-text-primary">Delete:</strong> Request complete deletion of your account and all associated data.</li>
                <li><strong className="text-text-primary">Portability:</strong> Download your data in a standard JSON format.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">6. Cookies & Local Storage</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary">Authentication Cookie (httpOnly):</strong> Required for secure session management.</li>
                <li><strong className="text-text-primary">Session Storage:</strong> Stores user preferences and UI state (cleared on tab close).</li>
              </ul>
              <p className="mt-2">We do not use third-party tracking cookies or advertising pixels.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">7. Data Retention</h2>
              <p>
                Your data is retained as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized, aggregated statistics may be retained indefinitely.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">8. Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary">Supabase:</strong> Database and authentication infrastructure.</li>
                <li><strong className="text-text-primary">Google OAuth:</strong> Optional social login (only email and name are accessed).</li>
                <li><strong className="text-text-primary">Vercel:</strong> Frontend hosting and CDN.</li>
                <li><strong className="text-text-primary">Render:</strong> Backend API hosting.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Your continued use of the Service after changes indicates acceptance.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <p className="text-xs">
                For privacy-related inquiries, contact us at{" "}
                <a href="mailto:amanshankarsingh2001@gmail.com" className="text-primary hover:underline">
                  amanshankarsingh2001@gmail.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
