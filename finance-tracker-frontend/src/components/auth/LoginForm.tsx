"use client";

import { useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";
import { Wallet, ArrowRight, Loader, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { loginService, loginWithGoogle } from "@/service/service_auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import PhoneInput, {
  type Value,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* Custom input for phone component */
const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-transparent outline-none text-[15px] placeholder:text-text-secondary text-text-primary"
  />
));
Input.displayName = "Input";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function AuthForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"phone" | "google" | null>(
    null
  );
  const [phone, setPhone] = useState<Value>();
  const [error, setError] = useState("");

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    try {
      setLoadingType("phone");
      setError("");
      const profileComplete = await loginService(phone.toString(), dispatch);
      router.push(profileComplete ? "/dashboard" : "/profile");
    } catch (err) {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingType("google");
      await loginWithGoogle();
    } catch {
      setError("Google sign-in failed.");
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-muted">
      {/* Dot grid background — matches home page */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-[440px] mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {/* Back to home */}
          <motion.div variants={fadeUp} className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Back to home
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card p-8 md:p-10 relative z-10"
          >
            {/* Brand Header */}
            <motion.div variants={fadeUp} className="flex flex-col items-center mb-10">
              <div className="mb-6">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white dark:text-black" />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-text-secondary text-[15px]">
                  Sign in to your account to continue
                </p>
              </div>
            </motion.div>

            {/* Phone Login Form */}
            <motion.form
              variants={fadeUp}
              onSubmit={handlePhoneLogin}
              className="space-y-6"
            >
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-text-secondary ml-0.5">
                  Phone Number
                </Label>

                {/* Phone Input */}
                <div className="group relative flex h-12 items-center rounded-xl border border-border bg-card px-3 transition-all duration-200 focus-within:border-ring">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={phone}
                    onChange={setPhone}
                    inputComponent={Input}
                    className="flex flex-1 items-center gap-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountrySelectArrow]:text-text-secondary"
                  />
                </div>

                <p className="text-xs text-text-secondary ml-0.5">
                  We&apos;ll verify your phone number on our end
                </p>
              </div>

              {error && (
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-text-secondary" />
                    <p className="text-sm font-medium text-text-secondary">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  !phone || !isValidPhoneNumber(phone) || loadingType === "phone"
                }
                className={`w-full h-12 bg-primary text-white dark:text-black font-medium rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 ${
                  loadingType === "phone" ? "opacity-80" : ""
                }`}
              >
                {loadingType === "phone" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Continue with Phone</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </motion.form>

            {/* Divider */}
            <motion.div variants={fadeUp} className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs font-medium uppercase tracking-widest text-text-secondary">
                  Or
                </span>
              </div>
            </motion.div>

            {/* Social Logins */}
            <motion.div variants={fadeUp} className="space-y-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loadingType === "google"}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-full border-border bg-card hover:bg-muted transition-colors"
              >
                {loadingType === "google" ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Connecting...</span>
                  </>
                ) : (
                  <>
                    <img
                      src="/logos/google-g-2015.svg"
                      className="h-4 w-4"
                      alt="Google"
                    />
                    <span className="text-sm font-medium text-text-secondary">
                      Continue with Google
                    </span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                disabled
                className="w-full h-12 flex items-center justify-center gap-3 rounded-full border-border bg-card opacity-50 cursor-not-allowed relative"
              >
                <img
                  src="/logos/microsoft-5.svg"
                  className="h-4 w-4"
                  alt="Microsoft"
                />
                <span className="text-sm font-medium text-text-secondary">
                  Microsoft 365
                </span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider font-medium text-text-secondary border border-border px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div variants={fadeUp} className="mt-10 pt-6 border-t border-border">
              <p className="text-center text-xs text-text-secondary leading-relaxed">
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="font-medium text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </p>

              {/* Help Link */}
              <div className="mt-5 text-center">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors group"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Need help signing in?</span>
                  <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Demo Notice */}
          <motion.div variants={fadeUp} className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-pulse" />
              <span className="text-xs font-medium text-text-secondary">
                Demo: Use +91 9599742303 for testing
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}