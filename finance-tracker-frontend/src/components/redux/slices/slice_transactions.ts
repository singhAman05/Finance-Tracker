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

const dedupeTransactions = (items: any[]) => {
    const seen = new Set<string>();
    const unique: any[] = [];

    for (const item of items) {
        const id = typeof item?.id === "string" ? item.id : "";
        if (!id) {
            unique.push(item);
            continue;
        }
        if (seen.has(id)) continue;
        seen.add(id);
        unique.push(item);
    }

    return unique;
};

const initialState: TransactionState = {
    transactions: [],
};

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setTransactions(state, action) {
            const normalized = Array.isArray(action.payload)
                ? action.payload.map((tx: unknown) =>
                    normalizeTransaction((tx ?? {}) as Record<string, unknown>)
                )
                : [];
            state.transactions = dedupeTransactions(normalized);
        },
        addTransaction(state, action) {
            const normalized = normalizeTransaction((action.payload ?? {}) as Record<string, unknown>) as Record<string, unknown>;
            const id = typeof normalized["id"] === "string" ? (normalized["id"] as string) : "";

            if (!id) {
                state.transactions.unshift(normalized);
                return;
            }

            const existingIndex = state.transactions.findIndex((transaction) => transaction.id === id);
            if (existingIndex >= 0) {
                state.transactions[existingIndex] = normalized;
                return;
            }

            state.transactions.unshift(normalized);
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
