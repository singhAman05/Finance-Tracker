"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  Zap,
  Shield,
  Database,
  Globe,
  Layers,
  Clock,
  CheckCircle2,
  Send,
  Star,
  Code2,
  Server,
  Cpu,
  GitBranch,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EngineeringBlog() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "", rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
      setFormState({ name: "", email: "", message: "", rating: 0 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xs text-text-secondary font-medium uppercase tracking-widest">Engineering Blog</span>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-16 pb-12">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Engineering Deep Dive</p>
              <p className="text-xs text-text-secondary">Published May 2025 &middot; 10 min read</p>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter mb-4 leading-tight">
            How I Built FinanceTracker:<br />
            <span className="text-text-secondary">From Zero to Production</span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            A step-by-step walkthrough of building a full-stack finance app with sub-100ms latency, atomic transactions, and production-grade security — as a solo developer.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <article className="container mx-auto px-6 pb-16">
        <div className="max-w-3xl space-y-16">

          {/* Section 1: The Problem */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              The Problem I Wanted to Solve
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Most personal finance apps are either too bloated with features you don&apos;t need, require connecting bank accounts (security risk), or are locked behind expensive subscriptions. I wanted something that&apos;s fast, manual-entry focused, privacy-first, and actually enjoyable to use.
            </p>
            <p className="text-text-secondary leading-relaxed">
              The goal: build a production-ready finance tracker that handles everything — multi-account management, categorized transactions, budgets, recurring bills — with a beautiful UI and enterprise-grade reliability.
            </p>
          </motion.section>

          {/* Section 2: Architecture */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              Architecture & Tech Stack
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-5 rounded-xl border border-border/60">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Frontend
                </h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li>• Next.js 15 (App Router, SSR + CSR)</li>
                  <li>• React 19 with Server Components where applicable</li>
                  <li>• TypeScript for end-to-end type safety</li>
                  <li>• Redux Toolkit for global state management</li>
                  <li>• Tailwind CSS v4 + Framer Motion</li>
                  <li>• Recharts for data visualization</li>
                </ul>
              </div>
              <div className="p-5 rounded-xl border border-border/60">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Backend
                </h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li>• Express 5 on Node.js</li>
                  <li>• PostgreSQL via Supabase (managed)</li>
                  <li>• Redis for caching + session optimization</li>
                  <li>• JWT httpOnly cookies + CSRF tokens</li>
                  <li>• Phone OTP + Google OAuth auth</li>
                  <li>• Deployed on Render (auto-scaling)</li>
                </ul>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed">
              The frontend is deployed on <strong>Vercel</strong> for edge-optimized delivery, while the backend runs on <strong>Render</strong> with auto-sleep disabled for consistent response times. PostgreSQL is hosted on Supabase with connection pooling via PgBouncer.
            </p>
          </motion.section>

          {/* Section 3: Latency */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              How I Reduced Latency to Sub-100ms
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Financial data needs to feel instant. Nobody wants to wait 2 seconds to see their balance. Here&apos;s the multi-layer approach:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Redis Caching Layer",
                  desc: "Account balances, category lists, and dashboard aggregates are cached in Redis with intelligent TTLs. Cache invalidation happens on write operations using a key-pattern strategy.",
                },
                {
                  title: "Optimistic UI Updates",
                  desc: "When you add a transaction, the UI updates immediately via Redux state mutation. The server request happens in background. If it fails, we roll back gracefully.",
                },
                {
                  title: "Connection Pooling",
                  desc: "Supabase's PgBouncer handles connection pooling, eliminating cold-start connection overhead. Each query reuses warm connections.",
                },
                {
                  title: "Selective Data Fetching",
                  desc: "Instead of fetching all data on every page load, each page fetches only what it needs. Pagination for transactions, lazy loading for reports.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-border/60">
              <p className="text-sm font-medium mb-2">Result:</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">67ms</p>
                  <p className="text-[10px] text-text-secondary uppercase">Avg API Response</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">12ms</p>
                  <p className="text-[10px] text-text-secondary uppercase">Cache Hit</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">&lt;50ms</p>
                  <p className="text-[10px] text-text-secondary uppercase">UI Update</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4: Atomicity */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Cpu className="w-5 h-5 text-primary" />
              Ensuring Atomicity in Financial Operations
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              In a finance app, partial writes are catastrophic. If you transfer money between accounts and only one side updates, your data is corrupted. Here&apos;s how I guarantee atomicity:
            </p>
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border/60">
                <h4 className="font-semibold text-sm mb-2">Database Transactions (BEGIN/COMMIT/ROLLBACK)</h4>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  Every operation that touches multiple tables is wrapped in a PostgreSQL transaction. Adding a transaction updates the <code className="px-1.5 py-0.5 rounded bg-muted text-xs">transactions</code> table AND the <code className="px-1.5 py-0.5 rounded bg-muted text-xs">accounts</code> balance in a single atomic operation.
                </p>
                <div className="p-3 rounded-lg bg-muted font-mono text-xs leading-relaxed overflow-x-auto">
                  <pre>{`BEGIN;
  INSERT INTO transactions (amount, type, account_id, ...) VALUES (...);
  UPDATE accounts SET balance = balance + amount WHERE id = account_id;
COMMIT;
-- If any step fails → ROLLBACK (no partial state)`}</pre>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border/60">
                <h4 className="font-semibold text-sm mb-2">Idempotency Keys</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Each transaction creation request includes a client-generated idempotency key. If the same request is retried (network timeout, user double-click), the server returns the existing result instead of creating a duplicate.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-border/60">
                <h4 className="font-semibold text-sm mb-2">Optimistic Locking</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Account balance updates use a version check: <code className="px-1.5 py-0.5 rounded bg-muted text-xs">WHERE version = expected_version</code>. If concurrent updates conflict, the later one retries with the fresh state.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 5: Security */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              Security Architecture
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Finance data is sensitive. The security model is defense-in-depth:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "JWT tokens in httpOnly, Secure, SameSite cookies",
                "CSRF double-submit pattern with sessionStorage fallback",
                "Row-level security in PostgreSQL (user can only see own data)",
                "Input validation at API boundary (express-validator)",
                "Rate limiting on auth endpoints (prevent brute force)",
                "CORS restricted to frontend domain only",
                "Secrets in environment variables, never in code",
                "Google OAuth 2.0 with PKCE flow",
              ].map((item) => (
                <div key={item} className="flex gap-2 items-start p-3 rounded-lg border border-border/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 6: Step by Step */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-primary" />
              Step-by-Step Build Process
            </h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Database Design", desc: "Designed the schema first: users, accounts, transactions, categories, budgets, bills. Normalized to 3NF with strategic denormalization for read-heavy queries." },
                { step: "2", title: "Auth System", desc: "Built phone OTP (via Twilio-style service) and Google OAuth. Implemented JWT rotation, refresh tokens, and CSRF protection for cross-origin deployment." },
                { step: "3", title: "Core API", desc: "RESTful endpoints for CRUD operations on all entities. Express 5 with async error handling, validation middleware, and consistent error response format." },
                { step: "4", title: "Caching Layer", desc: "Added Redis caching for frequently accessed data. Implemented cache-aside pattern with write-through invalidation on mutations." },
                { step: "5", title: "Frontend Shell", desc: "Built the Next.js app with app router. Implemented auth flow, protected routes, and global state with Redux Toolkit slices." },
                { step: "6", title: "Feature Pages", desc: "Dashboard, Accounts, Transactions, Categories, Budgets, Bills, Reports, Settings — each with full CRUD, animations, and responsive design." },
                { step: "7", title: "Production Hardening", desc: "Added error boundaries, loading states, optimistic updates, rate limiting, CORS config, health checks, and monitoring." },
                { step: "8", title: "Deployment", desc: "CI/CD with Vercel (frontend) and Render (backend). Environment-specific configs, SSL, custom domain setup." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 pb-4 border-b border-border/40 last:border-0">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 7: Future */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              What&apos;s Next
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              The app is live and actively used, but the roadmap is ambitious:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered spending insights and predictions",
                "Receipt scanning with OCR auto-categorization",
                "Multi-currency support with live exchange rates",
                "Shared accounts for families/couples",
                "Mobile app (React Native) with offline sync",
                "Export to CSV/PDF for tax filing",
                "Webhooks for custom integrations",
                "Dark/Light theme with custom color schemes",
              ].map((item) => (
                <div key={item} className="flex gap-2 items-center p-3 rounded-lg bg-accent/50 border border-border/40">
                  <Star className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-xs text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Feedback Form */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-2 tracking-tight flex items-center gap-3">
              <Send className="w-5 h-5 text-primary" />
              Share Your Feedback
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Loved it? Found a bug? Want a feature? Let me know — every submission comes directly to my inbox.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-xl border border-border/60 bg-accent/50 text-center"
              >
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Thank you!</h3>
                <p className="text-sm text-text-secondary">Your feedback has been sent. I&apos;ll read it personally.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-primary font-medium hover:underline"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium mb-1.5 text-text-secondary">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium mb-1.5 text-text-secondary">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">
                    Rating (optional)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormState({ ...formState, rating: star })}
                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          formState.rating >= star
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-text-secondary hover:text-primary"
                        }`}
                      >
                        <Star className="w-4 h-4" fill={formState.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium mb-1.5 text-text-secondary">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    placeholder="What did you think? Any suggestions?"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.section>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">&copy; 2026 FinanceTracker. Built by Aman Shankar Singh.</p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <Link href="/terms" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
