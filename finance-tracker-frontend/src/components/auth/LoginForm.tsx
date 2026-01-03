"use client";

import { useState, useEffect, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";
import { Phone, Mail, ChevronRight, BadgeQuestionMark } from "lucide-react";

import { loginService, loginWithGoogle } from "@/service/service_auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import PhoneInput, {
  type Value,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* Custom input for phone component with refined styling */
const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-transparent outline-none text-[15px] placeholder:text-muted-foreground/60 text-slate-900 dark:text-slate-100"
  />
));
Input.displayName = "Input";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-50 dark:opacity-20">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-100 to-transparent dark:from-blue-900/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800/30 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[440px] mx-auto">
        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.3)] border border-white/50 dark:border-slate-800/50 relative z-10">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-7">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white rounded-xl blur-sm opacity-30"></div>
              <div className="relative h-14 w-14 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 rounded-xl flex items-center justify-center shadow-lg">
                <div className="h-6 w-6 bg-gradient-to-br from-white to-slate-200 dark:from-slate-900 dark:to-black rounded-full"></div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {/* Phone Login Form */}
          <form
            onSubmit={handlePhoneLogin}
            className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Phone Number
                <span className="text-red-500 ml-1">*</span>
              </Label>

              {/* Refined Phone Input Wrapper */}
              <div className="group relative flex h-12 items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-slate-950/10 dark:focus-within:ring-white/10 focus-within:border-slate-900 dark:focus-within:border-slate-300">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={phone}
                  onChange={setPhone}
                  inputComponent={Input}
                  // This is crucial for fixing the layout
                  className="flex flex-1 items-center gap-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountrySelectArrow]:text-slate-400"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                We'll will verify your phone number on our end
              </p>
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
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
              className={`w-full h-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-300 text-white dark:text-slate-900 font-semibold rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-white/5 hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/10 hover:opacity-95 active:scale-[0.98] transition-all duration-200 ${
                loadingType === "phone" ? "opacity-90 scale-[0.99]" : ""
              }`}
            >
              {loadingType === "phone" ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying Number...</span>
                </div>
              ) : (
                "Continue with Phone"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300/50 dark:border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loadingType === "google"}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              {loadingType === "google" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Continue with Google</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] rounded-full blur-sm opacity-20 group-hover:opacity-30"></div>
                    <img
                      src="/logos/google-g-2015.svg"
                      className="relative h-5 w-5"
                      alt="Google"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Continue with Google
                  </span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              disabled
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60 cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-700/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4EF] to-[#7FBA00] rounded-full blur-sm opacity-20"></div>
                <img
                  src="/logos/microsoft-5.svg"
                  className="relative h-5 w-5"
                  alt="Microsoft"
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Microsoft 365
              </span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                Soon
              </span>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </a>
              .
            </p>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
              >
                <BadgeQuestionMark className="h-3.5 w-3.5" />
                <span>Need help signing in?</span>
                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </a>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Demo: Use +91 9599742303 for testing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
