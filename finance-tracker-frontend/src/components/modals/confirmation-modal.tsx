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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
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
        <Card className="rounded-2xl border border-border bg-background p-6 shadow-xl">
          {/* Icon */}
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={loading}
            >
              {cancelText}
            </Button>

            <Button
              className="w-full"
              variant={variant === "danger" ? "destructive" : "default"}
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
