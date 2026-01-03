"use client";

import { useState, useEffect, forwardRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";

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
    <div className="w-full max-w-[420px] mx-auto">
      {/* Container with soft shadow and subtle border */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/60">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-12 w-12 bg-slate-900 dark:bg-white rounded-xl mb-6 flex items-center justify-center">
            {/* Replace with your Logo SVG */}
            <div className="h-5 w-5 bg-white dark:bg-black rounded-full" />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">
            Please enter your details to sign in
          </p>
        </div>

        {/* Phone Login Form */}
        <form onSubmit={handlePhoneLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 ml-1">
              Phone number
            </Label>
            <div className="group flex h-12 items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-slate-950/10 dark:focus-within:ring-white/10 focus-within:border-slate-400 dark:focus-within:border-slate-600">
              <PhoneInput
                international
                defaultCountry="IN"
                value={phone}
                onChange={setPhone}
                inputComponent={Input}
                className="flex-1"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              !phone || !isValidPhoneNumber(phone) || loadingType === "phone"
            }
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl font-medium transition-all active:scale-[0.98]"
          >
            {loadingType === "phone" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        {/* Divider with improved visual weight */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-950 px-4 text-slate-400 font-medium">
              OR
            </span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loadingType === "google"}
            className="h-12 flex gap-2 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <img
              src="/logos/google-g-2015.svg"
              className="h-4 w-4"
              alt="Google"
            />
            <span className="text-sm font-medium">
              {loadingType === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Google"
              )}
            </span>
          </Button>

          <Button
            variant="outline"
            disabled
            className="h-12 flex gap-2 rounded-xl border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
          >
            <img
              src="/logos/microsoft-5.svg"
              className="h-4 w-4"
              alt="Microsoft"
            />
            <span className="text-sm font-medium">Office</span>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
          By clicking continue, you agree to our <br />
          <a
            href="#"
            className="underline underline-offset-4 hover:text-slate-900 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-slate-900 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
