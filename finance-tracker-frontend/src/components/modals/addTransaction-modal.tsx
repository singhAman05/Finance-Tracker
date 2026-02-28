"use client";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { closeModal } from "@/components/redux/slices/slice_modal";
import AddTransaction from "@/components/transactions/addTransaction";

export function AddTransactionModal() {
  const dispatch = useDispatch();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-start justify-center bg-background/40 backdrop-blur-md p-4 overflow-y-auto"
      onClick={() => dispatch(closeModal())}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl my-auto"
      >
        <AddTransaction onClose={() => dispatch(closeModal())} />
      </motion.div>
    </motion.div>
  );
}
