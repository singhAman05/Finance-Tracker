"use client";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { closeModal } from "@/components/redux/slices/slice_modal";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmationModalProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => Promise<void> | void;
}

export function ConfirmationModal({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
}: ConfirmationModalProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleClose = () => dispatch(closeModal());

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md px-4"
      >
        <Card className="rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          {/* Icon */}
          <div className="mb-4 flex items-center justify-center relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2 relative z-10">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3 relative z-10">
            <Button
              variant="outline"
              className="w-full rounded-full h-11 border-border text-text-primary hover:bg-muted font-semibold transition-all"
              onClick={handleClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              className="w-full rounded-full h-11 bg-danger text-white hover:bg-danger/90 font-semibold shadow-lg shadow-danger/10 transition-all"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
