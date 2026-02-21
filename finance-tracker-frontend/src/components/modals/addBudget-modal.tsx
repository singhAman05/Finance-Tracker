"use client";

import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { closeModal } from "@/components/redux/slices/slice_modal";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";

export const AddBudgetModal = () => {
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(closeModal());
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 overflow-y-auto"
            onClick={handleClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    transition: {
                        type: "spring",
                        damping: 25,
                        stiffness: 400,
                    },
                }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AddBudgetForm onClose={handleClose} />
            </motion.div>
        </motion.div>
    );
};
