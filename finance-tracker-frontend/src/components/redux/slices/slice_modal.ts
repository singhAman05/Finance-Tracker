import { createSlice, PayloadAction } from "@reduxjs/toolkit";
    export type ModalType =
    | "ADD_ACCOUNT"
    | "ADD_TRANSACTION"
    | "CONFIRM_DELETE";

export type ModalPayload =
  | ConfirmDeletePayload
  | undefined;

export interface ConfirmDeletePayload {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

interface ModalState {
    type: ModalType | null;
    payload?: ModalPayload;
}

const initialState: ModalState = {
    type: null,
    payload: undefined,
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        openModal: (
            state,
            action: PayloadAction<{
                type: ModalType;
                payload?: ModalPayload;
            }>
            ) => {
            state.type = action.payload.type;
            state.payload = action.payload.payload;
            },

        closeModal: (state) => {
            state.type = null;
            state.payload = undefined;
        },
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
