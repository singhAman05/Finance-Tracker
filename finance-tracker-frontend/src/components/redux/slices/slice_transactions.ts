// src/redux/slices/slice_transactions.ts
import { createSlice } from "@reduxjs/toolkit";

type TransactionState = {
    transactions: any[];
};

const initialState: TransactionState = {
    transactions: [],
};

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setTransactions(state, action) {
            state.transactions = action.payload;
        },
        addTransaction(state, action) {
            state.transactions.push(action.payload);
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
