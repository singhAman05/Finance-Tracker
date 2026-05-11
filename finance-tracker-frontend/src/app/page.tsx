"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Wallet, PieChart, Shield, Smartphone, Zap, BarChart3, Lock, ArrowUpRight, Clock, Database, Globe, Users, Code2 } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, target, duration, rounded]);

  return <span>{display}</span>;
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function Home() {
  const router = useRouter();

  const handleAuthNavigation = () => {
    if (typeof window !== "undefined") {
      const user = sessionStorage.getItem("user");
      if (user) {
        router.push("/dashboard");
        return;
      }
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 glass sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinanceTracker</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 items-center"
          >
            <Link href="/blog/engineering" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Engineering
            </Link>
            <button
              onClick={handleAuthNavigation}
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={handleAuthNavigation}
              className="px-5 py-2 rounded-full gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 relative">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="grid lg:grid-cols-2 gap-12 items-center relative">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-xs font-medium tracking-wide uppercase text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Free to get started
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tighter">
              Master your <br />
              <span className="text-text-secondary">money flow.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-text-secondary mb-8 leading-relaxed max-w-lg">
              Precision financial tracking for the modern era. Visualize expenses, manage accounts, set budgets, and track bills &mdash; without the clutter.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAuthNavigation}
                className="group px-8 py-3.5 rounded-full gradient-primary text-white hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2 w-fit cursor-pointer shadow-md hover:shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/blog/engineering"
                className="px-8 py-3.5 rounded-full border border-border text-text-primary hover:bg-muted transition-all font-medium flex items-center justify-center gap-2 w-fit"
              >
                How we built it
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-secondary">Open-source &middot; Self-hostable &middot; No data selling</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg dark:shadow-none">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-5 rounded-full bg-muted flex items-center px-3">
                    <Lock className="w-2.5 h-2.5 text-text-secondary mr-1.5" />
                    <span className="text-[10px] text-text-secondary">financetracker.app/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Balance", value: "24,580", prefix: "$" },
                    { label: "Income", value: "8,200", prefix: "+" },
                    { label: "Savings", value: "32", suffix: "%" },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="p-3 rounded-xl bg-card border border-border"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">{stat.label}</p>
                      <p className="text-lg font-bold tracking-tight">
                        {stat.prefix}<AnimatedCounter target={parseInt(stat.value.replace(",", ""))} />
                        {stat.suffix}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="rounded-xl bg-card border border-border p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-text-secondary">Monthly Overview</span>
                    <BarChart3 className="w-3.5 h-3.5 text-text-secondary" />
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm bg-primary"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1.2 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-text-secondary">Jan</span>
                    <span className="text-[9px] text-text-secondary">Dec</span>
                  </div>
                </motion.div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute right-0 sm:-right-4 top-16 bg-card border border-border rounded-xl p-3 shadow-lg max-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">Savings up</p>
                  <p className="text-[9px] text-text-secondary">+12% this month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="border-y border-border py-5 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-3xl mx-auto"
        >
          {[
            { value: "< 100ms", label: "API Response Time" },
            { value: "15+", label: "RESTful Endpoints" },
            { value: "Redis", label: "Backed Caching" },
            { value: "RLS", label: "Row-Level Security" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* What is FinanceTracker */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              What is FinanceTracker?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              A full-stack personal finance management platform that helps you track every rupee &mdash; income, expenses, budgets, recurring bills, and account balances &mdash; all in one place with real-time insights.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: PieChart, text: "Visual dashboards & reports with monthly cash flow analysis" },
                { icon: Shield, text: "Bank-grade security with encrypted data and CSRF protection" },
                { icon: Zap, text: "Sub-100ms API responses with Redis caching layer" },
              ].map((item) => (
                <div key={item.text} className="flex gap-3 p-4 rounded-xl border border-border/60">
                  <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 max-w-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              What to expect.
            </h2>
            <p className="text-text-secondary">
              Everything you need to maintain financial clarity, stripped down to the essentials.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Smartphone, title: "Multi-Platform", description: "Seamless access across all your devices with synchronized data in real-time.", stat: "3+ Platforms" },
              { icon: PieChart, title: "Smart Categorization", description: "Organize transactions by category with color-coded insights and spending breakdowns.", stat: "Auto-Categorize" },
              { icon: Zap, title: "Instant Sync", description: "Real-time updates ensure your balance is always accurate. Redis-backed caching for speed.", stat: "< 100ms" },
              { icon: BarChart3, title: "Budget Tracking", description: "Set monthly budgets per category, get alerts when you approach limits.", stat: "Smart Alerts" },
              { icon: Clock, title: "Recurring Bills", description: "Never miss a payment. Auto-generated bill reminders and scheduled tracking.", stat: "Auto-Reminders" },
              { icon: TrendingUp, title: "Reports & Analytics", description: "Monthly, quarterly, and custom period reports with exportable data.", stat: "Deep Insights" },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group p-6 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-accent/50 transition-all duration-300 shadow-soft hover:shadow-elevated"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl border border-border/60 bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <feature.icon className="w-4 h-4 text-primary stroke-[1.5]" />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                    {feature.stat}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Why trust us?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Built with production-grade security and reliability practices from day one.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "End-to-End Security", desc: "JWT + CSRF double-submit protection. httpOnly cookies. Row-level DB security." },
              { icon: Database, title: "Your Data, Your Rules", desc: "Export or delete all data anytime. We never sell or share your financial info." },
              { icon: Globe, title: "Open Architecture", desc: "Built on open standards: PostgreSQL, Redis, Next.js. No vendor lock-in." },
              { icon: Users, title: "Community Driven", desc: "Feedback directly shapes the roadmap. Read our engineering blog for full transparency." },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 rounded-xl border border-border/60"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2 tracking-tight">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Three steps to clarity.
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Get set up in minutes, not hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with phone or Google in under 30 seconds. No credit card required." },
              { step: "02", title: "Add Accounts", desc: "Add your bank accounts, credit cards, and wallets. Set initial balances." },
              { step: "03", title: "Track & Grow", desc: "Log transactions, set budgets, track bills. Watch your financial clarity improve." },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-primary mb-3 tracking-tighter">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-text-secondary max-w-[220px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Built with modern tech.
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Production-grade stack designed for performance, security, and scalability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
          >
            {[
              "Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Redux Toolkit",
              "Node.js", "Express 5", "PostgreSQL", "Supabase", "Redis",
              "Framer Motion", "Recharts", "JWT Auth", "Vercel", "Render",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-text-primary transition-colors"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <Link
              href="/blog/engineering"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
            >
              <Code2 className="w-4 h-4" />
              Read the full engineering story
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-xl gradient-primary text-white p-10 md:p-16 text-center relative overflow-hidden shadow-lg"
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-sm font-medium uppercase tracking-widest mb-4 text-white/70">
              Start today
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter text-white">
              Ready to clarify your finances?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Join thousands who have already transformed their relationship with money.
            </p>
            <button
              onClick={handleAuthNavigation}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all font-medium cursor-pointer shadow-md"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 py-10">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5" />
                <span className="font-bold tracking-tight">FinanceTracker</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Personal finance management built for clarity and speed.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                <Link href="/blog/engineering" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Engineering Blog</Link>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Legal</p>
              <div className="space-y-2">
                <Link href="/terms" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</Link>
                <Link href="/help" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Help Center</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-secondary">&copy; 2026 FinanceTracker Inc.</p>
            <p className="text-xs text-text-secondary">Made with precision in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
