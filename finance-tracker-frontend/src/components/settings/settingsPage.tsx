"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RootState } from "@/app/store";
import { fetchSettings, updateSettings, ClientSettings, exportAllData } from "@/service/service_settings";
import { setSettings, updateLocalSettings, setLoading, setError } from "@/components/redux/slices/slice_settings";
import { Bell, Globe, Database, Download, Trash2, ArrowLeft, Receipt, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { SettingsFixture } from "@/bones/fixtures";
import { useRouter } from "next/navigation";
import { openModal } from "@/components/redux/slices/slice_modal";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { settings, loading } = useSelector((state: RootState) => state.settings);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce timer ref to batch rapid changes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Partial<ClientSettings>>({});

  useEffect(() => {
    const loadSettings = async () => {
      if (!settings) {
        dispatch(setLoading(true));
        try {
          const data = await fetchSettings();
          if (data?.data) dispatch(setSettings(data.data));
        } catch (err) {
          dispatch(setError("Failed to load settings"));
        } finally {
          dispatch(setLoading(false));
        }
      }
    };
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const flushUpdates = useCallback(async () => {
    const updates = { ...pendingUpdates.current };
    pendingUpdates.current = {};
    if (Object.keys(updates).length === 0) return;

    setIsSaving(true);
    try {
      const result = await updateSettings(updates);
      if (result?.data) dispatch(setSettings(result.data));
    } catch (err) {
      dispatch(setError("Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  }, [dispatch]);

  const handleUpdate = useCallback((updates: Partial<ClientSettings>) => {
    // Update UI immediately
    dispatch(updateLocalSettings(updates));

    // Accumulate changes and debounce the API call
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushUpdates, 600);
  }, [dispatch, flushUpdates]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        flushUpdates();
      }
    };
  }, [flushUpdates]);

  const handleExportCSV = () => {
    exportAllData()
      .then((res) => {
        const payload = res?.data ?? res;
        const fileName = `finance-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        dispatch(setError("Failed to export data"));
      });
  };

  const handleClearHistory = () => {
    dispatch(
      openModal({
        type: "CONFIRM_DELETE",
        payload: {
          title: "Clear all history?",
          description:
            "This will delete all your transactions and bills history and cannot be undone.",
          confirmText: "Clear History",
          cancelText: "Cancel",
          actionKey: "CLEAR_HISTORY",
        },
      })
    );
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  if (loading && !settings) {
    return (
      <Skeleton name="settings" loading={true} fixture={<SettingsFixture />}>
        <div className="w-full min-h-[400px]">
          <div className="h-[400px]" />
        </div>
      </Skeleton>
    );
  }

  const currentSettings = settings || {
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    notify_bills: true,
    notify_budgets: true,
    notify_recurring: true
  };

  const notificationItems = [
    {
      key: "notify_bills" as keyof ClientSettings,
      label: "Upcoming Bills",
      description: "Get alerted before bills are due",
      icon: Receipt,
    },
    {
      key: "notify_budgets" as keyof ClientSettings,
      label: "Budget Alerts",
      description: "Warnings when approaching category limits",
      icon: TrendingUp,
    },
    {
      key: "notify_recurring" as keyof ClientSettings,
      label: "Recurring Transactions",
      description: "Summary of auto-processed transactions",
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-8 lg:px-12 py-6 md:py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 relative z-10 max-w-[1280px] mx-auto w-full"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-border bg-card text-text-primary hover:bg-muted h-10 px-4 inline-flex items-center cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Settings
              </h1>
              <p className="text-sm sm:text-base font-medium text-text-secondary mt-1">
                Manage your preferences, notifications, and account settings
              </p>
            </div>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
              Saving changes…
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Preferences */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    General Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {/* Currency */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/50">
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">Currency</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Used across dashboard and reports</p>
                    </div>
                    <select
                      className="bg-muted border border-border text-text-primary text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/30 appearance-none min-w-[160px] font-medium cursor-pointer transition-colors hover:bg-muted/80"
                      value={currentSettings.currency}
                      onChange={(e) => handleUpdate({ currency: e.target.value })}
                    >
                      <option value="INR">₹ INR — Indian Rupee</option>
                      <option value="USD">$ USD — US Dollar</option>
                      <option value="EUR">€ EUR — Euro</option>
                      <option value="GBP">£ GBP — British Pound</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">Date Format</h3>
                      <p className="text-xs text-text-secondary mt-0.5">How dates are displayed in tables</p>
                    </div>
                    <select
                      className="bg-muted border border-border text-text-primary text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring/30 appearance-none min-w-[160px] font-medium cursor-pointer transition-colors hover:bg-muted/80"
                      value={currentSettings.date_format}
                      onChange={(e) => handleUpdate({ date_format: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 divide-y divide-border/50">
                  {notificationItems.map(({ key, label, description, icon: Icon }, idx) => {
                    const isChecked = Boolean(currentSettings[key]);
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-between gap-4 py-4",
                          idx === 0 && "pt-0",
                          idx === notificationItems.length - 1 && "pb-0"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-1.5 rounded-lg mt-0.5 transition-colors",
                            isChecked ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Icon className={cn(
                              "h-3.5 w-3.5 transition-colors",
                              isChecked ? "text-primary" : "text-text-secondary"
                            )} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-text-primary">{label}</h3>
                            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(checked) => handleUpdate({ [key]: checked } as Partial<ClientSettings>)}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column — Data Management */}
          <div>
            <motion.div variants={fadeUp}>
              <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all group cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Download className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-text-primary">Export Data</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Download all history as JSON</p>
                    </div>
                  </button>

                  <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-danger/20 hover:bg-danger/5 hover:border-danger/30 transition-all group cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0 group-hover:bg-danger/15 transition-colors">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-danger">Clear History</h4>
                      <p className="text-xs text-danger/60 mt-0.5">Delete all transactions & bills</p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

