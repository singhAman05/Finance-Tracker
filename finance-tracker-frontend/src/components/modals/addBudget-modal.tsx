"use client";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { closeModal } from "@/components/redux/slices/slice_modal";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import { MODAL_CONTENT_VARIANTS, MODAL_OVERLAY_VARIANTS } from "@/components/modals/modalAnimations";

export const AddBudgetModal = () => {
  const dispatch = useDispatch();
  const handleClose = () => dispatch(closeModal());

  return (
    <motion.div
      key="add-budget-overlay"
      variants={MODAL_OVERLAY_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[150] flex items-start justify-center bg-background/40 backdrop-blur-md p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <motion.div
        variants={MODAL_CONTENT_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AddBudgetForm onClose={handleClose} />
      </motion.div>
    </motion.div>
  );
};