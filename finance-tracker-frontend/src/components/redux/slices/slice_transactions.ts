// src/redux/slices/slice_transactions.ts
import { createSlice } from "@reduxjs/toolkit";

type TransactionState = {
    transactions: any[];
};

const normalizeTransaction = (tx: Record<string, unknown>) => ({
    ...tx,
    date:
        tx?.date instanceof Date
            ? tx.date.toISOString()
            : tx?.date ?? null,
});

const initialState: TransactionState = {
    transactions: [],
};

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setTransactions(state, action) {
            state.transactions = Array.isArray(action.payload)
                ? action.payload.map((tx: unknown) =>
                    normalizeTransaction((tx ?? {}) as Record<string, unknown>)
                )
                : [];
        },
        addTransaction(state, action) {
            state.transactions.push(
                normalizeTransaction((action.payload ?? {}) as Record<string, unknown>)
            );
        },
        removeTransaction(state, action) {
            state.transactions = state.transactions.filter(
                (transaction) => transaction.id !== action.payload
            );
        },
    },
});

export const { setTransactions, addTransaction, removeTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
