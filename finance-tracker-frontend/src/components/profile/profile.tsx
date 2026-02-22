"use client";

import { useState, useEffect, useMemo, forwardRef } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { Input as BaseInput } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { profileRoute } from "@/routes/route_profile";
import { Loader2, User, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* Custom input for phone component with refined styling to match your UI */
const CustomPhoneInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-transparent outline-none text-[15px] placeholder:text-muted-foreground/60 text-slate-900 dark:text-slate-100 h-full"
  />
));
CustomPhoneInput.displayName = "CustomPhoneInput";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [isExistingPhone, setIsExistingPhone] = useState(false);
  const [isExistingEmail, setIsExistingEmail] = useState(false);
  const [role, setRole] = useState<"student" | "professional">("student");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setName(parsed.fullName || parsed.full_name || "");
      
      const existingEmail = parsed.email || "";
      if (existingEmail) {
        setEmail(existingEmail);
        setIsExistingEmail(true);
      }

      const existingPhone = parsed.phone || "";
      if (existingPhone && isValidPhoneNumber(existingPhone)) {
        setPhone(existingPhone);
        setIsExistingPhone(true);
      }
    }
  }, []);

  // Updated Validation Logic
  const isNameValid = name.trim().length > 0;
  const isEmailValid = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone ? isValidPhoneNumber(phone) : false;

  // Phone is optional if Email already existed (Google login)
  // Email is mandatory always
  // Name is mandatory always
  const canSubmit = 
    isNameValid && 
    isEmailValid && 
    (isExistingEmail ? (phone ? isPhoneValid : true) : isPhoneValid) && 
    !loading;

  const progress = useMemo(() => {
    let steps = 0;
    if (isNameValid) steps += 33;
    if (isEmailValid) steps += 33;
    if (isExistingEmail ? (phone ? isPhoneValid : true) : isPhoneValid) steps += 34;
    return Math.min(steps, 100);
  }, [isNameValid, isEmailValid, isExistingEmail, phone, isPhoneValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await profileRoute({
        full_name: name.trim(),
        email: email.trim(),
        phone: phone || "", // This will now be in format +1234567890
        profession: role,
        profile_complete: true,
      });
      toast.success("Profile setup complete!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Profile Setup
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-1">
            Complete your information to personalize your finance dashboard
          </p>

          {/* Progress bar */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
              <span className="text-slate-500">Completion</span>
              <span
                className={
                  progress === 100
                    ? "text-green-500"
                    : "text-slate-900 dark:text-white"
                }
              >
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-4">
                Basic Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Full Name
                  </Label>
                  <BaseInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <BaseInput
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isExistingEmail}
                      placeholder="e.g. alex@example.com"
                      className={cn(
                        "h-12 rounded-xl",
                        isExistingEmail && "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-70"
                      )}
                    />
                    {isExistingEmail && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Phone with Country Code */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Phone Number {!isExistingEmail && <span className="text-red-500">*</span>}
                  </Label>
                  <div
                    className={cn(
                      "flex items-center px-3 h-12 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white transition-all",
                      isExistingPhone &&
                        "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                    )}
                  >
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        value={phone}
                        onChange={setPhone}
                        disabled={isExistingPhone}
                        inputComponent={CustomPhoneInput}
                        className="flex-1"
                      />
                    </div>
                    {phone && !isPhoneValid && (
                      <p className="text-[10px] font-medium text-red-500">
                        Please enter a valid phone number
                      </p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Primary Role
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {["student", "professional"].map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRole(id as any)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all text-left",
                          role === id
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black shadow-lg"
                            : "border-slate-100 dark:border-slate-800 hover:border-slate-300"
                        )}
                      >
                        <span className="font-bold text-sm capitalize">
                          {id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "w-full h-14 text-sm font-bold uppercase tracking-widest rounded-2xl transition-all",
                    canSubmit
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Complete Profile Setup"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Side Panel Tips */}
          <div className="hidden md:block">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 tracking-tight">
                ✦ Why complete this?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Complete your profile to receive real-time SMS alerts for your
                transactions and personalized budget advice based on your
                profession.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
