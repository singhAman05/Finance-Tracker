"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, Mail, Phone, MessageCircle, Shield, Key, Smartphone, Globe, Cookie } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HelpPage() {
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Back to login
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Help Center</h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-text-secondary mb-12 max-w-lg">
            Having trouble signing in? Here are the most common solutions.
          </motion.p>

          {/* Common Issues */}
          <motion.div variants={fadeUp} className="space-y-6 mb-16">
            {[
              {
                icon: Phone,
                title: "Phone number not working?",
                steps: [
                  "Make sure you're entering your number with the correct country code (e.g., +91 for India).",
                  "Check that the number is a valid mobile number, not a landline.",
                  "If you've recently changed your number, you'll need to create a new account.",
                ],
              },
              {
                icon: Shield,
                title: "Google sign-in failing?",
                steps: [
                  "Ensure pop-ups are not blocked in your browser.",
                  "Try clearing your browser cookies and cache, then attempt again.",
                  "Make sure you're using a personal Google account (some workspace accounts may be restricted).",
                ],
              },
              {
                icon: Key,
                title: "Session keeps expiring?",
                steps: [
                  "Sessions last 1 hour for security. You'll need to sign in again after that.",
                  "Make sure your browser is not blocking third-party cookies (required for cross-domain auth).",
                  "Try using a different browser or disable privacy extensions temporarily.",
                ],
              },
              {
                icon: Globe,
                title: "Authentication failing on Safari, Brave, or private browsing?",
                steps: [
                  "We recommend using Google Chrome for the best experience — it handles third-party cookies correctly out of the box.",
                  "Safari, Brave, and private/incognito windows block third-party cookies by default, which prevents our authentication from working.",
                  "If you must use another browser, go to your browser's cookie/privacy settings and allow third-party cookies for this site.",
                  "In Safari: Settings → Privacy → uncheck 'Prevent cross-site tracking'.",
                  "In Brave: Settings → Shields → set 'Block cookies' to 'Only block cross-site cookies' or lower.",
                ],
              },
              {
                icon: Smartphone,
                title: "App not loading correctly?",
                steps: [
                  "Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).",
                  "Clear your browser's site data for this domain.",
                  "Ensure you have a stable internet connection.",
                  "Try an incognito/private browsing window (note: you may need to allow third-party cookies).",
                ],
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-text-primary">{item.title}</h3>
                </div>
                <ol className="space-y-2 ml-12">
                  {item.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-text-primary font-medium shrink-0">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeUp} className="border-t border-border pt-10">
            <h2 className="text-xl font-bold tracking-tight mb-6">Still need help?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:amanshankarsingh2001@gmail.com"
                className="flex items-center gap-3 p-5 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">Email Support</p>
                  <p className="text-xs text-text-secondary">Usually responds within 24h</p>
                </div>
              </a>
              <Link
                href="/blog/engineering"
                className="flex items-center gap-3 p-5 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">Feedback & Blog</p>
                  <p className="text-xs text-text-secondary">Share feedback or read updates</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
