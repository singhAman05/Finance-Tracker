"use client";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { closeModal } from "@/components/redux/slices/slice_modal";
import { AddAccount } from "@/components/accounts/addAccount";
import { MODAL_CONTENT_VARIANTS, MODAL_OVERLAY_VARIANTS } from "@/components/modals/modalAnimations";

export function AddAccountModal() {
  const dispatch = useDispatch();

  return (
    <motion.div
      key="add-account-overlay"
      variants={MODAL_OVERLAY_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[150] flex items-start justify-center bg-background/40 backdrop-blur-md p-4 overflow-y-auto"
      onClick={() => dispatch(closeModal())}
    >
      <motion.div
        variants={MODAL_CONTENT_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl my-auto"
      >
        <AddAccount onClose={() => dispatch(closeModal())} />
      </motion.div>
    </motion.div>
  );
}