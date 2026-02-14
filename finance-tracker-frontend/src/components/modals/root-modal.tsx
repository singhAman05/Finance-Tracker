"use client";

import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

import { RootState } from "@/app/store";
import { ModalType } from "@/components/redux/slices/slice_modal";

import { AddAccountModal } from "@/components/modals/addAccount-modal";
import { AddTransactionModal } from "@/components/modals/addTransaction-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";

/**
 * Maps modal type → component (VALUES, not TYPES)
 */
const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<any>> = {
  ADD_ACCOUNT: AddAccountModal,
  ADD_TRANSACTION: AddTransactionModal,
  CONFIRM_DELETE: ConfirmationModal,
};

export function RootModal() {
  const { type, payload } = useSelector((state: RootState) => state.modal);

  if (!type) return null;

  const ModalComponent = MODAL_COMPONENTS[type];

  return (
    <AnimatePresence mode="wait">
      {ModalComponent && <ModalComponent {...payload} />}
    </AnimatePresence>
  );
}
