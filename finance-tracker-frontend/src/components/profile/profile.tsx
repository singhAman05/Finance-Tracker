"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { profileRoute } from "@/routes/route_profile";
import { Loader2, User, Mail, Phone } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"student" | "professional">("student");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setName(parsed.fullName || parsed.full_name || "");
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileRoute({
        full_name: name,
        email,
        phone,
        profession: role,
        profile_complete: true,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
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
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 flex items-center justify-center">
              <User className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Profile Setup
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-13">
            Complete your profile to unlock personalized features and
            recommendations
          </p>

          {/* Progress indicator */}
          <div className="mt-6 ml-13 max-w-md">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                Step 1 of 2
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                60% complete
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Main Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Form Header */}
              <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Basic Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tell us about yourself to personalize your experience
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Full Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={email}
                        disabled
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Verified email address
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={phone || "Not provided"}
                        disabled
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Optional - you can add this later
                    </p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Primary Role
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        id: "student",
                        label: "Student",
                        icon: "🎓",
                        description: "Currently enrolled in education",
                      },
                      {
                        id: "professional",
                        label: "Professional",
                        icon: "💼",
                        description: "Working in the industry",
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id as any)}
                        className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${
                          role === item.id
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black shadow-sm"
                            : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <p className="text-xs opacity-80">{item.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-white dark:text-slate-900 font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Setting up your profile...</span>
                      </div>
                    ) : (
                      "Complete Profile Setup"
                    )}
                  </Button>
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                    You can update this information anytime from your profile
                    settings
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel - Information & Tips */}
          <div className="space-y-6">
            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Why complete your profile?
                </h3>
              </div>
              <ul className="space-y-2">
                {[
                  "Personalized content recommendations",
                  "Keeping your data secure",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
                🔒 Your privacy matters
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                We only use your information to personalize your experience.
                Your data is secure and never shared without your consent.
              </p>
            </div>

            {/* Next Steps Preview */}
          </div>
        </div>
      </div>
    </div>
  );
}
