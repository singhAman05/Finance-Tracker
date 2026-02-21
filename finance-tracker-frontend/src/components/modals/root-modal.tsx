"use client";

import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

import { RootState } from "@/app/store";
import { ModalType } from "@/components/redux/slices/slice_modal";

import { AddAccountModal } from "@/components/modals/addAccount-modal";
import { AddTransactionModal } from "@/components/modals/addTransaction-modal";
import { AddBillModal } from "@/components/modals/addBill-modal";
import { AddBudgetModal } from "@/components/modals/addBudget-modal";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";

const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<any>> = {
  ADD_ACCOUNT: AddAccountModal,
  ADD_TRANSACTION: AddTransactionModal,
  ADD_BILL: AddBillModal,
  ADD_BUDGET: AddBudgetModal,
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
