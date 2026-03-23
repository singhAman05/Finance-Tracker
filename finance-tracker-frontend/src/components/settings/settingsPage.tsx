"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RootState } from "@/app/store";
import { fetchSettings, updateSettings, ClientSettings } from "@/service/service_settings";
import { setSettings, updateLocalSettings, setLoading, setError } from "@/components/redux/slices/slice_settings";
import { Bell, Globe, Calendar, Database, Shield, MonitorSmartphone, Download, Trash2, KeyRound } from "lucide-react";
import Loader from "@/utils/loader";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state: RootState) => state.settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      // Fast path: if we already have it in Redux, no need to show initial loader
      if (!settings) dispatch(setLoading(true));
      try {
        const data = await fetchSettings();
        if (data?.data) dispatch(setSettings(data.data));
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to load settings"));
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadSettings();
  }, [dispatch, settings]);

  const handleUpdate = async (updates: Partial<ClientSettings>) => {
    // Optimistic update in Redux for immediate UI response
    dispatch(updateLocalSettings(updates));
    setIsSaving(true);
    try {
      await updateSettings(updates);
    } catch (err) {
      console.error(err);
      // Let the user know it failed (perhaps could revert optimistic update here too)
      dispatch(setError("Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    // We already have a CSV export in the service_reports area, but a dedicated 'Export All' 
    // functionality would normally trigger a separate backend job or frontend assembly.
    // For now, providing a visual placeholder action.
    alert("Full data export initiated. This will download shortly.");
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading && !settings) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Loader size="md" text="Loading settings..." />
      </div>
    );
  }

  // Fallback defaults if load fails completely
  const currentSettings = settings || {
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    notify_bills: true,
    notify_budgets: true,
    notify_recurring: true
  };

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
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
        className="flex flex-col gap-6 relative z-10 mx-auto w-full"
      >
        {/* Settings Header Block */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Settings
            </h1>
            <p className="text-sm sm:text-base font-medium text-text-secondary mt-1">
              Manage your preferences, notifications, and account settings
            </p>
          </div>
          {isSaving && (
             <div className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full">
                <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                Saving...
             </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - General & Notifications */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Preferences Section */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    General Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                    <div>
                      <h3 className="font-bold text-base text-text-primary mb-1">Currency</h3>
                      <p className="text-sm text-text-secondary">Used across dashboard and reports</p>
                    </div>
                    <select
                      className="bg-muted border border-border text-text-primary text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] font-medium"
                      value={currentSettings.currency}
                      onChange={(e) => handleUpdate({ currency: e.target.value })}
                    >
                      <option value="INR">₹ (INR) Indian Rupee</option>
                      <option value="USD">$ (USD) US Dollar</option>
                      <option value="EUR">€ (EUR) Euro</option>
                      <option value="GBP">£ (GBP) British Pound</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base text-text-primary mb-1">Date Format</h3>
                      <p className="text-sm text-text-secondary">How dates are displayed in tables</p>
                    </div>
                    <select
                      className="bg-muted border border-border text-text-primary text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] font-medium"
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

            {/* Notifications Section */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                      <Bell className="h-5 w-5 text-indigo-500" />
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between gap-4 pb-6 border-b border-border/50">
                    <div>
                      <h3 className="font-bold text-base text-text-primary mb-1">Upcoming Bills</h3>
                      <p className="text-sm text-text-secondary">Get alerted before bills are due</p>
                    </div>
                    <Switch 
                      checked={currentSettings.notify_bills} 
                      onCheckedChange={(checked) => handleUpdate({ notify_bills: checked })}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 pb-6 border-b border-border/50">
                    <div>
                      <h3 className="font-bold text-base text-text-primary mb-1">Budget Alerts</h3>
                      <p className="text-sm text-text-secondary">Warnings when approaching category limits</p>
                    </div>
                    <Switch 
                      checked={currentSettings.notify_budgets} 
                      onCheckedChange={(checked) => handleUpdate({ notify_budgets: checked })}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base text-text-primary mb-1">Recurring Transactions</h3>
                      <p className="text-sm text-text-secondary">Summary of auto-processed transactions</p>
                    </div>
                    <Switch 
                      checked={currentSettings.notify_recurring} 
                      onCheckedChange={(checked) => handleUpdate({ notify_recurring: checked })}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Data & Account */}
          <div className="space-y-8">
            {/* Data Management */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <Database className="h-5 w-5 text-emerald-500" />
                    </div>
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <button 
                    onClick={handleExportCSV}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Download className="h-5 w-5 text-text-secondary group-hover:text-emerald-500 transition-colors" />
                      <div>
                        <h4 className="font-bold text-sm text-text-primary">Export Data</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Download all history as CSV</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-danger/20 hover:bg-danger/5 transition-all group">
                    <div className="flex items-center gap-3 text-left">
                      <Trash2 className="h-5 w-5 text-danger opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <h4 className="font-bold text-sm text-danger">Clear History</h4>
                        <p className="text-xs text-danger/70 mt-0.5">Delete all transactions & bills</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Security */}
            <motion.div variants={fadeUp}>
              <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <Shield className="h-5 w-5 text-amber-500" />
                    </div>
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center gap-3 text-left">
                      <KeyRound className="h-5 w-5 text-text-secondary group-hover:text-amber-500 transition-colors" />
                      <div>
                        <h4 className="font-bold text-sm text-text-primary">Change Password</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Update your login credentials</p>
                      </div>
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
