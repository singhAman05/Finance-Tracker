"use client";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { closeModal } from "@/components/redux/slices/slice_modal";
import { AddAccount } from "@/components/accounts/addAccount";

export function AddAccountModal() {
  const dispatch = useDispatch();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={() => dispatch(closeModal())}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl px-4"
      >
        <AddAccount onClose={() => dispatch(closeModal())} />
      </motion.div>
    </motion.div>
  );
}
