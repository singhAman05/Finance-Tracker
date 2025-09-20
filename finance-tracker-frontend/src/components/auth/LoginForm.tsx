"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useState, forwardRef } from "react";
import { loginService } from "@/service/service_auth";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { AppDispatch } from "@/app/store";
import PhoneInput, { type Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Custom input component to avoid prop warnings
const CustomInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="bg-transparent border-none focus:ring-0 outline-none w-full dark:text-white"
  />
));
CustomInput.displayName = "CustomInput";

export default function AuthForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [phone, setPhone] = useState<Value>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const phoneString = phone?.toString() || "";
      const profileComplete = await loginService(phoneString, dispatch);
      setLoading(false);
      router.push(profileComplete ? "/dashboard" : "/profile");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
          <span className="text-gray-600 dark:text-gray-300 text-xl font-bold">
            LOGO
          </span>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your phone number to continue
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Phone Number
            </Label>

            <div className="relative">
              <PhoneInput
                international
                defaultCountry="IN"
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
                className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600"
                countrySelectProps={{
                  className:
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 pr-8",
                }}
                inputComponent={CustomInput}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full flex justify-center py-3 bg-gray-900 hover:bg-black text-white dark:bg-gray-800 dark:hover:bg-gray-900 transition-colors"
            disabled={loading || !phone}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
