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
            state.transactions = Array.isArray(action.payload) ? action.payload : [];
        },
        addTransaction(state, action) {
            if (action.payload) {
                state.transactions.unshift(action.payload);
            }
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
