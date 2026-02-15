"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Wallet, PieChart, Shield, Smartphone, Zap, BarChart3, Lock, ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
      const token = localStorage.getItem("jwt");
      const user = localStorage.getItem("user");
      if (token && user) {
        router.push("/dashboard");
        return;
      }
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FinanceTracker
            </span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 items-center"
          >
            <button 
              onClick={handleAuthNavigation}
              className="text-sm font-medium hover:text-textSecondary transition-colors">
              Log in
            </button>
            <button 
              onClick={handleAuthNavigation}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-28 pb-36 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="grid lg:grid-cols-2 gap-16 items-center relative">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-xs font-medium tracking-wide uppercase text-textSecondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Free to get started
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-bold mb-8 leading-[0.95] tracking-tighter">
              Master your <br />
              <span className="text-textSecondary">money flow.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-textSecondary mb-10 leading-relaxed max-w-lg">
              Precision financial tracking for the modern era. Visualize expenses and manage accounts without the clutter.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAuthNavigation}
                className="group px-8 py-4 rounded-full bg-primary text-white hover:opacity-90 transition-all font-medium text-lg flex items-center justify-center gap-2 w-fit"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-border flex items-center justify-center text-[10px] font-bold text-textSecondary">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-textSecondary">
                <span className="font-semibold text-textPrimary">2,400+</span> people already tracking
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
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-neutral-200/50 dark:shadow-none">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-5 rounded-full bg-muted flex items-center px-3">
                    <Lock className="w-2.5 h-2.5 text-textSecondary mr-1.5" />
                    <span className="text-[10px] text-textSecondary">financetracker.app/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
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
                      <p className="text-[10px] uppercase tracking-wider text-textSecondary mb-1">{stat.label}</p>
                      <p className="text-lg font-bold tracking-tight">
                        {stat.prefix}<AnimatedCounter target={parseInt(stat.value.replace(",", ""))} />
                        {stat.suffix}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart placeholder - animated bars */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="rounded-xl bg-card border border-border p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-textSecondary">Monthly Overview</span>
                    <BarChart3 className="w-3.5 h-3.5 text-textSecondary" />
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
                    <span className="text-[9px] text-textSecondary">Jan</span>
                    <span className="text-[9px] text-textSecondary">Dec</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute -right-4 top-16 bg-card border border-border rounded-xl p-3 shadow-lg max-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-textPrimary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium">Savings up</p>
                  <p className="text-[9px] text-textSecondary">+12% this month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Stats Band */}
      <section className="border-y border-border py-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-16 md:gap-24 items-center"
        >
          {[
            { value: "50K+", label: "Transactions Tracked" },
            { value: "99.9%", label: "Uptime" },
            { value: "2.4K", label: "Active Users" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center flex-shrink-0">
              <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-textSecondary mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 max-w-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Essential utilities.
            </h2>
            <p className="text-xl text-textSecondary max-w-xl">
              Everything you need to maintain financial clarity, stripped down to the essentials.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Multi-Platform",
                description: "Seamless access across all your devices with synchronized data.",
                stat: "3+ Platforms"
              },
              {
                icon: PieChart,
                title: "Smart Sorting",
                description: "Intelligent categorization algorithms that learn from your spending.",
                stat: "Auto-Categorize"
              },
              {
                icon: Zap,
                title: "Instant Sync",
                description: "Real-time updates ensure your balance is always accurate to the second.",
                stat: "< 100ms"
              }
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-2xl border border-border hover:border-ring transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:border-ring transition-colors">
                      <feature.icon className="w-5 h-5 text-textPrimary stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-textSecondary group-hover:text-textPrimary transition-colors">
                      {feature.stat}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-textSecondary leading-relaxed text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Three steps to clarity.
            </h2>
            <p className="text-lg text-textSecondary max-w-md mx-auto">
              Get set up in minutes, not hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create Account", desc: "Sign up for free in under 30 seconds." },
              { step: "02", title: "Link Accounts", desc: "Add your bank accounts and credit cards." },
              { step: "03", title: "Track & Grow", desc: "Watch your financial clarity improve daily." },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-muted mb-4 tracking-tighter">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-textSecondary max-w-[200px] mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-primary text-white dark:text-black p-12 md:p-24 text-center relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-medium uppercase tracking-widest mb-6 text-neutral-400 dark:text-neutral-500"
            >
              Start today
            </motion.p>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
              Ready to clarify your finances?
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 mb-10 max-w-md mx-auto">
              Join thousands who have already transformed their relationship with money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleAuthNavigation}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-black text-black dark:text-white hover:scale-105 transition-transform font-medium"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all">
             <Wallet className="w-5 h-5" />
             <span className="font-bold tracking-tight">FinanceTracker</span>
           </div>
          <p className="text-sm text-textSecondary">
            © 2026 FinanceTracker Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}