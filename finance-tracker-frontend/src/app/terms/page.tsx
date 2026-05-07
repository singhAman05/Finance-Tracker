"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function TermsOfService() {
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
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Terms of Service</h1>
          </div>

          <p className="text-sm text-text-secondary mb-10">Last updated: May 7, 2026</p>

          <div className="prose prose-sm max-w-none space-y-8 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using FinanceTracker (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">2. Description of Service</h2>
              <p>
                FinanceTracker is a personal financial management application that allows users to track income, expenses, budgets, and bills. The Service is provided &quot;as is&quot; for personal, non-commercial use.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must be at least 18 years old to use this Service.</li>
                <li>One person may not maintain more than one account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Attempt to gain unauthorized access to any part of the Service.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Upload malicious code or attempt to exploit vulnerabilities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">5. Data & Privacy</h2>
              <p>
                Your financial data is stored securely and is never sold to third parties. Please refer to our{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-2">Privacy Policy</Link>{" "}
                for detailed information about how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">6. Service Availability</h2>
              <p>
                We strive for 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or due to circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">7. Intellectual Property</h2>
              <p>
                All content, design, code, and branding of FinanceTracker are owned by us. You may not reproduce, distribute, or create derivative works without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">8. Limitation of Liability</h2>
              <p>
                FinanceTracker is a tracking tool and does not provide financial advice. We are not liable for any financial decisions made based on data displayed in the Service. The Service is provided without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violations of these terms. You may delete your account at any time through the Settings page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3">10. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email or in-app notification.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <p className="text-xs">
                If you have questions about these Terms, please contact us at{" "}
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
